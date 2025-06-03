import { generateCommitMessages } from '../lib/openai.js';
import { simpleGit } from 'simple-git';
import inquirer from 'inquirer';
import chalk from 'chalk';
import { cleanCommitMessages } from '../utils/format.js';
import {
  GitChimpConfig,
  loadGitChimpConfig,
} from '../utils/config.js';
import { isConventionalCommit } from '../utils/git.js';

const git = simpleGit();

export async function handleCommitCommand(
  cliOptions?: Partial<GitChimpConfig> & {
    custom?: boolean;
    message?: boolean;
    enforceCc?: boolean;
  }
) {
  const fileConfig = await loadGitChimpConfig();
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
      console.log(chalk.yellow('⚠️ No staged changes found.'));
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
        console.log(
          chalk.red(
            '❌ Commit message does not follow Conventional Commit format.'
          )
        );
        console.log(
          chalk.yellow(
            'Expected format: "type(scope): description"\nExample: "feat(auth): add login button"'
          )
        );
        process.exit(1);
      }

      await git.commit(customMessage);
      console.log(chalk.green('✅ Commit created!'));
      process.exit(0);
    }

    // 2. Non-interactive mode (for piping)
    if (messageMode) {
      const messages = await generateCommitMessages(
        diff,
        3,
        config.tone,
        config.model
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
      config.tone,
      config.model
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
      console.log(
        chalk.red(
          '❌ Commit message does not follow Conventional Commit format.'
        )
      );
      console.log(
        chalk.yellow(
          'Expected format: "type(scope): description"\nExample: "feat(auth): add login button"'
        )
      );
      process.exit(1);
    }
    await git.commit(finalMessage);
    console.log(chalk.green('✅ Commit created!'));
  } catch (error) {
    console.error(chalk.red('❌ Error creating commit:'), error);
  }
}
