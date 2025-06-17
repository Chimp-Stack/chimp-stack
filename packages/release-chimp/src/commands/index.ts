import { Command } from 'commander';
import {
  addChimpConfigCommand,
  addChimpInitCommand,
} from '@chimp-stack/core';
import { handleBump } from './bump.js';

const version = __VERSION__;

const program = new Command();

export function runCLI() {
  program
    .name('release-chimp')
    .description(
      '🦧 Manage releases and changelogs with ease, the lazy way.'
    )
    .version(version);

  addChimpInitCommand(program, 'releaseChimp');
  addChimpConfigCommand(program, 'releaseChimp');

  program
    .command('bump <part>')
    .description('Bump version: patch, minor, or major')
    .option(
      '--dry-run',
      'Preview changes without writing files or committing'
    )
    .option('--no-package-json', 'Skip updating package.json version')
    .option('--no-changelog', 'Skip generating and writing changelog')
    .option('--no-git', 'Skip git commit, tag, and push')
    .action(handleBump);

  program.parse(process.argv);
}
