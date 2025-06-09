import { generateCommitMessages } from '../lib/openai.js';
import { simpleGit } from 'simple-git';
import inquirer from 'inquirer';
import { cleanCommitMessages } from '../utils/format.js';
import { isConventionalCommit } from '../utils/git.js';
import {
  GitChimpConfig,
  loadChimpConfig,
  logError,
  logWarn,
  logSuccess,
} from 'chimp-core';

const git = simpleGit();

export async function handleCommitCommand(
  cliOptions?: Partial<GitChimpConfig> & {
    custom?: boolean;
    message?: boolean;
    enforceCc?: boolean;
    scope?: string;
  }
) {
  const fileConfig = loadChimpConfig('gitChimp') as GitChimpConfig;
  const config: GitChimpConfig = {
    ...fileConfig,
    ...cliOptions,
  };

  const enforceCommits =
    config.enforceConventionalCommits || cliOptions?.enforceCc;

  const useCustomMessage = cliOptions?.custom || false;
  const messageMode = cliOptions?.message || false;

  try {
    const diff = await git.diff(['--staged']);

    if (!diff) {
      logWarn('⚠️ No staged changes found.');
      process.exit(0);
    }

    // 1. Custom message flow
    if (useCustomMessage) {
      const { customMessage } = await inquirer.prompt([
        {
          type: 'input',
          name: 'customMessage',
          message: 'Enter your custom commit message:',
          validate: (input: string) =>
            input.length > 0 || 'Message cannot be empty!',
        },
      ]);
      if (enforceCommits && !isConventionalCommit(customMessage)) {
        logError(
          '❌ Commit message does not follow Conventional Commit format.'
        );

        logWarn(
          'Expected format: "type(scope): description"\nExample: "feat(auth): add login button"'
        );
        process.exit(1);
      }

      await git.commit(customMessage);
      logSuccess('✅ Commit created!');
      process.exit(0);
    }

    // 2. Non-interactive mode (for piping)
    if (messageMode) {
      const messages = await generateCommitMessages(
        diff,
        3,
        enforceCommits,
        config.tone,
        config.model,
        cliOptions?.scope
      );
      const first = messages[0] ?? 'chore: update';

      // Output for piping into git
      console.log(first);
      return;
    }

    // 3. Interactive picker (default flow)
    const rawSuggestions = await generateCommitMessages(
      diff,
      3,
      enforceCommits,
      config.tone,
      config.model,
      cliOptions?.scope
    );
    const messages = cleanCommitMessages(rawSuggestions);
    messages.push('✏️ Write my own');

    const { selectedMessage } = await inquirer.prompt([
      {
        type: 'list',
        name: 'selectedMessage',
        message: 'Pick a commit message:',
        choices: messages.map((msg, index) => ({
          name: `${index + 1}. ${msg}`,
          value: msg,
        })),
      },
    ]);

    let finalMessage = selectedMessage;

    if (selectedMessage === '✏️ Write my own') {
      const { customMessage } = await inquirer.prompt([
        {
          type: 'input',
          name: 'customMessage',
          message: 'Enter your custom commit message:',
          validate: (input: string) =>
            input.length > 0 || 'Message cannot be empty!',
        },
      ]);
      finalMessage = customMessage;
    }

    if (enforceCommits && !isConventionalCommit(finalMessage)) {
      logError(
        '❌ Commit message does not follow Conventional Commit format.'
      );
      logWarn(
        'Expected format: "type(scope): description"\nExample: "feat(auth): add login button"'
      );
      process.exit(1);
    }
    await git.commit(finalMessage);
    logSuccess('✅ Commit created!');
  } catch (error) {
    logError(`❌ Error creating commit: ${error}`);
  }
}
