import chalk from 'chalk';
import { simpleGit } from 'simple-git';
import { Octokit } from '@octokit/rest';
import {
  generatePullRequestDescription,
  generatePullRequestTitle,
} from '../lib/openai.js';
import readline from 'readline';
import {
  GitChimpConfig,
  loadGitChimpConfig,
  validatePrTitle,
} from '../utils/config.js';

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

  const fileConfig = await loadGitChimpConfig(); // from .git-chimprc
  const config: GitChimpConfig = {
    ...fileConfig,
    ...cliOptions,
  };

  if (!process.env.GITHUB_TOKEN || !process.env.GITHUB_REPO) {
    console.error(
      chalk.red(
        '❌ Missing GITHUB_TOKEN or GITHUB_REPO in environment variables.'
      )
    );
    process.exit(1);
  }

  const git = simpleGit();
  const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

  try {
    const currentBranch = (await git.branch()).current;

    console.log(
      chalk.blue(
        `📦 Preparing PR for branch: ${chalk.bold(currentBranch)}`
      )
    );
    console.log(
      chalk.blue('🔍 Generating pull request description with AI...')
    );

    const diff = await git.diff(['main', currentBranch]);
    let prTitle = `🚀 ${currentBranch}`;

    // If enforcing and title is not valid, fix it
    if (config.enforceSemanticPrTitles) {
      prTitle = await generatePullRequestTitle(
        diff,
        currentBranch,
        config.model
      );
      const isSemantic = validatePrTitle(prTitle, config, {
        throwOnError: false,
      });
      if (!isSemantic) {
        if (!isSemantic) {
          console.warn(
            chalk.yellow(
              `🤔 Generated PR title still isn't semantic: "${prTitle}"`
            )
          );
        }
      }
    } else {
      // if not enforcing, just log a warning if not semantic
      validatePrTitle(prTitle, config, { throwOnError: false });
    }

    const description = await generatePullRequestDescription(
      diff,
      config.tone,
      config.model
    );

    const prMode = config?.prMode ?? 'open';

    const validModes = ['open', 'draft', 'display'];
    if (!validModes.includes(prMode)) {
      console.error(
        chalk.red(
          `Invalid prMode: ${prMode}. Must be one of ${validModes.join(', ')}`
        )
      );
      process.exit(1);
    }

    if (prMode === 'display') {
      console.log(chalk.blue(`\n--- PR Title ---\n${prTitle}\n`));
      console.log(
        chalk.blue(`\n--- PR Description ---\n${description}\n`)
      );
      process.exit(0);
    }

    let owner, repo;

    if (process.env.GITHUB_REPO) {
      [owner, repo] = process.env.GITHUB_REPO.split('/');
    } else {
      const remotes = await git.getRemotes(true);
      const originRemote = remotes.find((r) => r.name === 'origin');

      if (!originRemote || !originRemote.refs.fetch) {
        console.error(
          chalk.red(
            '❌ Could not determine the GitHub repository from the remote.'
          )
        );
        process.exit(1);
      }

      const repoUrl = originRemote.refs.fetch;
      const match = repoUrl.match(
        /github\.com[/:](.+?)\/(.+?)(\.git)?$/
      );

      if (!match) {
        console.error(
          chalk.red(
            `❌ Failed to parse GitHub repo from remote URL: ${repoUrl}`
          )
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
      console.log(
        chalk.yellow(
          `⚠️ A pull request already exists: ${chalk.underline(existingPR.html_url)}`
        )
      );

      if (shouldAutoUpdate) {
        console.log(chalk.blue('🔁 Updating existing PR...'));
        await octokit.rest.pulls.update({
          owner,
          repo,
          pull_number: existingPR.number,
          body: description,
          draft: prMode === 'draft',
        });
        console.log(chalk.green('✅ PR updated successfully.'));
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
          console.log(chalk.green('✅ PR updated successfully.'));
        } else {
          console.log(chalk.gray('🚫 PR update canceled.'));
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

      console.log(
        chalk.green(
          `✅ PR created: ${chalk.underline.blue(pr.data.html_url)}`
        )
      );
    }

    process.exit(0);
  } catch (error) {
    console.error(chalk.red('🔥 Failed to handle PR:'), error);
    process.exit(1);
  }
}
