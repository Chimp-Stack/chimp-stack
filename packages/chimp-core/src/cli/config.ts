import chalk from 'chalk';
import { writeChimpConfig, loadChimpConfig } from '../config';

export function listConfig(scope: string) {
  const config = loadChimpConfig(scope);

  if (Object.keys(config).length === 0) {
    console.log(chalk.gray(`No config found for ${scope}.`));
  } else {
    console.log(chalk.bold(`Config for ${scope}:\n`));
    for (const [key, value] of Object.entries(config)) {
      if (typeof value === 'object') {
        console.log(chalk.cyan(`${key}:`));
        const jsonLines = JSON.stringify(value, null, 2).split('\n');
        for (const line of jsonLines) {
          console.log(chalk.gray('  ') + chalk.blueBright(line));
        }
      } else {
        console.log(
          `${chalk.cyan(key)}: ${chalk.blueBright(String(value))}`
        );
      }
    }
  }

  process.exit(0);
}

export function getConfig(scope: string, key: string) {
  const config = loadChimpConfig(scope);
  const val = config[key];

  if (val === undefined) {
    console.error(
      chalk.redBright(`✖ Key "${key}" not found in ${scope} config.`)
    );
    process.exit(1);
  } else {
    if (typeof val === 'object') {
      console.log(chalk.cyan(`${key}:`));
      const jsonLines = JSON.stringify(val, null, 2).split('\n');
      for (const line of jsonLines) {
        console.log(chalk.gray('  ') + chalk.blueBright(line));
      }
    } else {
      console.log(
        `${chalk.cyan(key)}: ${chalk.blueBright(String(val))}`
      );
    }

    process.exit(0);
  }
}

export function setConfig(scope: string, key: string, value: string) {
  writeChimpConfig({ [key]: value }, { scope, location: 'global' });
  console.log(
    chalk.greenBright(
      `✔ Set ${chalk.cyan(key)} = ${chalk.blueBright(value)} in ${scope} config.`
    )
  );
  process.exit(0);
}
