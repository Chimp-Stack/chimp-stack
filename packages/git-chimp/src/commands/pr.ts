import { simpleGit } from 'simple-git';
import { Octokit } from '@octokit/rest';
import {
  generatePullRequestDescription,
  generatePullRequestTitle,
} from '@chimp-stack/core/utils/openai';
import readline from 'readline';
import { validatePrTitle } from '../utils/git.js';
import {
  chalk,
  GitChimpConfig,
  loadChimpConfig,
} from '@chimp-stack/core';
import { filterDiff } from '@chimp-stack/core/utils/git';
import { chimplog } from '../utils/chimplog.js';

function askUser(question: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim().toLowerCase());
    });
  });
}

export async function handlePR(
  cliOptions?: Partial<GitChimpConfig> & {
    update?: boolean;
    prMode?: 'open' | 'draft' | 'display';
  }
) {
  const shouldAutoUpdate = !!cliOptions?.update;

  const fileConfig = loadChimpConfig('gitChimp') as GitChimpConfig;
  const config: GitChimpConfig = {
    ...fileConfig,
    ...cliOptions,
  };

  const githubToken = config.githubToken || process.env.GITHUB_TOKEN;

  if (!githubToken) {
    chimplog.error(
      '❌ Missing githubToken. Please set it in your .chimprc under "githubToken", or set the GITHUB_TOKEN environment variable.'
    );
    process.exit(1);
  }

  const git = simpleGit();
  const octokit = new Octokit({ auth: githubToken });
  try {
    const currentBranch = (await git.branch()).current;
    chimplog.info(
      `📦 Preparing PR for branch: ${chalk.bold(currentBranch)}`
    );
    chimplog.info(
      '🔍 Generating pull request description with AI...'
    );

    const rawDiff = await git.diff(['main', currentBranch]);
    const diff = filterDiff(rawDiff);
    let prTitle = `🚀 ${currentBranch}`;
    if (config.enforceSemanticPrTitles) {
      prTitle = await generatePullRequestTitle(
        diff,
        currentBranch,
        config.enforceSemanticPrTitles,
        config.tone,
        config.model
      );
      const isSemantic = validatePrTitle(prTitle, config, {
        throwOnError: false,
      });

      if (!isSemantic) {
        if (!isSemantic) {
          chimplog.warn(
            `🤔 Generated PR title still isn't semantic: "${prTitle}"`
          );
        }
      }
    } else {
      // if not enforcing, just log a warning if not semantic
      validatePrTitle(prTitle, config, {
        throwOnError: false,
      });
    }

    const description = await generatePullRequestDescription(
      diff,
      config.tone,
      config.model
    );

    const prMode = config?.prMode ?? 'open';

    const validModes = ['open', 'draft', 'display'];
    if (!validModes.includes(prMode)) {
      chimplog.error(
        `Invalid prMode: ${prMode}. Must be one of ${validModes.join(', ')}`
      );
      process.exit(1);
    }

    if (prMode === 'display') {
      chimplog.info(`\n--- PR Title ---\n${prTitle}\n`);
      chimplog.info(`\n--- PR Description ---\n${description}\n`);
      process.exit(0);
    }

    let owner, repo;

    if (process.env.GITHUB_REPO) {
      [owner, repo] = process.env.GITHUB_REPO.split('/');
    } else {
      const remotes = await git.getRemotes(true);
      const originRemote = remotes.find((r) => r.name === 'origin');

      if (!originRemote || !originRemote.refs.fetch) {
        chimplog.error(
          '❌ Could not determine the GitHub repository from the remote.'
        );
        process.exit(1);
      }

      const repoUrl = originRemote.refs.fetch;
      const match = repoUrl.match(
        /github\.com[/:](.+?)\/(.+?)(\.git)?$/
      );

      if (!match) {
        chimplog.error(
          `❌ Failed to parse GitHub repo from remote URL: ${repoUrl}`
        );
        process.exit(1);
      }

      [, owner, repo] = match;
    }

    const existingPRs = await octokit.rest.pulls.list({
      owner,
      repo,
      head: `${owner}:${currentBranch}`,
      state: 'open',
    });

    const existingPR = existingPRs.data[0];

    if (existingPR) {
      chimplog.warn(
        `⚠️ A pull request already exists: ${chalk.underline(existingPR.html_url)}`
      );

      if (shouldAutoUpdate) {
        chimplog.info('🔁 Updating existing PR...');
        await octokit.rest.pulls.update({
          owner,
          repo,
          pull_number: existingPR.number,
          body: description,
          draft: prMode === 'draft',
        });
        chimplog.success('✅ PR updated successfully.');
      } else {
        const answer = await askUser(
          'Do you want to update the existing PR? (y/N): '
        );
        if (answer === 'y' || answer === 'yes') {
          await octokit.rest.pulls.update({
            owner,
            repo,
            pull_number: existingPR.number,
            body: description,
            draft: prMode === 'draft',
          });
          chimplog.success('✅ PR updated successfully.');
        } else {
          chimplog.muted('🚫 PR update canceled.');
        }
      }
    } else {
      const pr = await octokit.rest.pulls.create({
        owner,
        repo,
        title: prTitle,
        head: currentBranch,
        base: 'main',
        body: description,
        draft: prMode === 'draft',
      });

      chimplog.success(
        `✅ PR created: ${chalk.underline.blue(pr.data.html_url)}`
      );
    }

    process.exit(0);
  } catch (error) {
    chimplog.error(`🔥 Failed to handle PR: ${error}`);
    process.exit(1);
  }
}
