import { Command } from 'commander';
import { handleOverview } from './overview.js';
import { addChimpConfigCommand } from 'chimp-core';

const version = __VERSION__;

const program = new Command();

export function runCLI() {
  program
    .name('doc-chimp')
    .description(
      '🦧 Generate useful docs from your git repo, the lazy way.'
    )
    .version(version);

  addChimpConfigCommand(program, 'docChimp');

  program
    .command('overview')
    .description('Generate a summary of recent commits')
    .action(handleOverview);

  program.parse(process.argv);
}
