import chalk from 'chalk';
import {
  loadGitChimpConfig,
  saveGitChimpConfig,
} from '../utils/config.js';
import type { GitChimpConfig } from '../utils/config.js';

type ConfigKey = keyof NonNullable<GitChimpConfig>;
type ConfigValue = string | boolean;

export async function handleConfig(cmd: {
  get?: ConfigKey;
  set?: ConfigKey;
  value?: ConfigValue;
  list?: boolean;
}) {
  const config = await loadGitChimpConfig();

  if (cmd.list) {
    console.log(chalk.blueBright(JSON.stringify(config, null, 2)));
    process.exit(0);
  }

  if (cmd.get) {
    const value = config[cmd.get];
    console.log(
      value === undefined ? chalk.yellow('(undefined)') : value
    );
    process.exit(0);
  }

  if (cmd.set && cmd.value !== undefined) {
    // Type coercion: convert "true"/"false" to booleans if necessary
    let parsedValue: ConfigValue = cmd.value;
    if (cmd.value === 'true') parsedValue = true;
    else if (cmd.value === 'false') parsedValue = false;

    config[cmd.set] = parsedValue as any;
    await saveGitChimpConfig(config);
    console.log(chalk.green(`✅ ${cmd.set} set to "${parsedValue}"`));
    process.exit(0);
  }

  console.log(
    chalk.red('No action specified – use --list, --get, or --set')
  );
  process.exit(1);
}
