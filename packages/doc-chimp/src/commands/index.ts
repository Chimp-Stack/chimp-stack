import { Command } from 'commander';
import { handleOverview } from './overview.js';
import {
  addChimpConfigCommand,
  addChimpInitCommand,
} from 'chimp-core';

const version = __VERSION__;

const program = new Command();

export function runCLI() {
  program
    .name('doc-chimp')
    .description(
      '🦧 Generate useful docs from your git repo, the lazy way.'
    )
    .version(version);

  addChimpInitCommand(program, 'docChimp');
  addChimpConfigCommand(program, 'docChimp');

  program
    .command('overview')
    .description(
      'Display a directory tree based on include/exclude patterns from your .chimprc'
    )
    .option('--pretty', 'Prettify output with colours')
    .action(handleOverview);

  program.parse(process.argv);
}
