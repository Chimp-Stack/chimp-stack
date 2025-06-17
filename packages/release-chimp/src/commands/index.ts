import { Command } from 'commander';
import {
  addChimpConfigCommand,
  addChimpInitCommand,
} from '@chimp-stack/core';

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

  program.parse(process.argv);
}
