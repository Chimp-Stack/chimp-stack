import { Command } from 'commander';
import { handleCommitCommand } from './commit.js';
import { handlePR } from './pr.js';
import {
  addChimpConfigCommand,
  addChimpInitCommand,
  addChangelogCommand,
} from '@chimp-stack/core/cli';

const version = __VERSION__;
const program = new Command();

export function runCLI() {
  program
    .name('git-chimp')
    .description(
      'Automate your commit messages and PRs with GPT. Because writing them sucks.'
    )
    .version(version);

  addChimpInitCommand(program, 'gitChimp');
  addChimpConfigCommand(program, 'gitChimp');
  addChangelogCommand(program, 'gitChimp');

  program
    .command('commit')
    .description(
      'Generate a commit message with GPT based on staged changes'
    )
    .option(
      '--scope <scope>',
      'Optional scope in include in commit message'
    )
    .option(
      '--tone <tone>',
      'Set the tone of the message (e.g. sarcastic, friendly, neutral)'
    )
    .option(
      '--enforce-cc',
      'Enforce Conventional Commits',
      (val) => val !== 'false'
    )
    .option(
      '--model <model>',
      'OpenAI model to use (gpt-3.5-turbo | gpt-4 | gpt-4o | gpt-4o-mini)'
    )
    .option('-c, --custom', 'Write a custom commit message')
    .option(
      '-m, --message',
      'Non-interactive mode, output commit message to stdout'
    )
    .action(handleCommitCommand);

  program
    .command('pr')
    .option(
      '--pr-mode <mode>',
      'Set PR mode: open, draft, or display'
    )
    .option(
      '--tone <tone>',
      'Set the tone of the message (e.g. sarcastic, friendly, neutral)'
    )
    .option(
      '-u, --update',
      'Automatically update existing PR if it exists',
      (val) => val !== 'true' // handles true/false as strings
    )
    .option(
      '--semantic-title',
      'Enforce semantic PR titles',
      (val) => val !== 'false'
    ) // handles true/false as strings
    .option(
      '--model <model>',
      'OpenAI model to use (gpt-3.5-turbo | gpt-4 | gpt-4o | gpt-4o-mini)'
    )
    .description(
      'Generate a pull request with GPT based on recent commits'
    )
    .action(handlePR);

  program.parse(process.argv);
}
