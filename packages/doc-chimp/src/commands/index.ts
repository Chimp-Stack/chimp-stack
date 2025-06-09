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
    .option(
      '--include <globs...>',
      'Override include globs from .chimprc'
    )

    .option(
      '--output [file]',
      'Write the overview tree to a file or directory. If no file is provided, defaults to outputDir/overview.{format}'
    )
    .option(
      '--format <format>',
      'Output format (json | markdown)',
      'markdown'
    )
    .option(
      '--undocumented',
      'Only include files lacking documentation'
    )
    .option(
      '--show-changelog',
      'Include latest changelog entry for each file'
    )
    .action(handleOverview);

  program.parse(process.argv);
}
