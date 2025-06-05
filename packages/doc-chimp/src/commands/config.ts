import chalk from 'chalk';
import {
  loadDocChimpConfig,
  saveDocChimpConfig,
} from '../utils/config.js';
import type { DocChimpConfigKey } from '../utils/config.js';

export async function handleConfig(cmd: {
  get?: DocChimpConfigKey;
  set?: DocChimpConfigKey;
  value?: string;
  list?: boolean;
}) {
  const config = await loadDocChimpConfig();

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
    let parsedValue: unknown = cmd.value;

    const key = cmd.set;
    const targetType = typeof config[key];

    if (targetType === 'boolean') {
      if (cmd.value === 'true') parsedValue = true;
      else if (cmd.value === 'false') parsedValue = false;
      else {
        console.error(
          chalk.red(`❌ "${cmd.value}" is not a valid boolean`)
        );
        process.exit(1);
      }
    }

    // Still need type assertion because TS isn't psychic
    (config as any)[key] = parsedValue;
    await saveDocChimpConfig(config);
    console.log(chalk.green(`✅ ${key} set to "${parsedValue}"`));
    process.exit(0);
  }

  console.log(
    chalk.red('No action specified – use --list, --get, or --set')
  );
  process.exit(1);
}
