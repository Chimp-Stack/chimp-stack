import { Command } from 'commander';
import { listConfig, getConfig, setConfig } from './config';

export function addChimpConfigCommand(
  program: Command,
  scope: string
) {
  const configCmd = program
    .command('config')
    .description(`Manage config for ${scope}`);

  configCmd
    .command('list')
    .description('List the current configuration')
    .action(() => listConfig(scope));

  configCmd
    .command('get')
    .description('Get a config value')
    .argument('<key>', 'Config key to get')
    .action((key) => getConfig(scope, key));

  configCmd
    .command('set')
    .description('Set a config value')
    .argument('<key>', 'Config key to set')
    .argument('<value>', 'Value to assign')
    .action((key, value) => setConfig(scope, key, value));
}
