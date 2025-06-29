import { Command } from 'commander';
import {
  addChimpConfigCommand,
  addChimpInitCommand,
  addChangelogCommand,
} from '@chimp-stack/core/cli';
import { handleBump } from './bump.js';
import { handleDetectBump } from './detect-bump.js';

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
  addChangelogCommand(program, 'releaseChimp');

  program
    .command('bump [part]')
    .description('Bump version: patch, minor, or major')
    .option('--ci', 'CI mode: skips changelog, git, and package.json')
    .option(
      '--dry-run',
      'Preview changes without writing files or committing'
    )
    .option('--ai', 'Use AI-generated changelog summary')
    .option('--no-package-json', 'Skip updating package.json version')
    .option('--no-changelog', 'Skip generating and writing changelog')
    .option('--no-git', 'Skip git commit, tag, and push')
    .option(
      '--output <format>',
      'Output format: json or text',
      'text'
    )
    .option(
      '--cwd <path>',
      'Change working directory before running command'
    )
    .action(handleBump);

  program
    .command('detect-bump')
    .description(
      'Detect recommended bump type (major, minor, patch) based on commit history'
    )
    .action(handleDetectBump);

  program.parse(process.argv);
}
