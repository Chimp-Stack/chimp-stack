import { Command } from 'commander';

// Import JSON using createRequire for NodeNext compatibility
import { createRequire } from 'node:module';
import { handleConfig } from './config.js';
import { handleOverview } from './overview.js';
const require = createRequire(import.meta.url);
const { version } = require('../../package.json');

const program = new Command();

export function runCLI() {
  program
    .name('doc-chimp')
    .description(
      '🦧 Generate useful docs from your git repo, the lazy way.'
    )
    .version(version);

  program
    .command('config')
    .description(
      'Get/set git-chimp configuration in .chimprc (JSON format)'
    )

    .option('-l, --list', 'List current config')
    .option('-g, --get <key>', 'Get value by key')
    .option('-s, --set <key>', 'Set value')
    .option('-v, --value <val>', 'Value when used with --set')
    .action(handleConfig);

  program
    .command('overview')
    .description('Generate a summary of recent commits')
    .action(handleOverview);

  program.parse(process.argv);
}
