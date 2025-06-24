import { getChalk } from '../utils/getChalk';

export async function logInfo(msg: string, prefix = '[chimp] ') {
  const chalk = await getChalk();
  console.log(chalk.blue(`${prefix}${msg}`));
}

export async function logSuccess(msg: string, prefix = '[chimp] ') {
  const chalk = await getChalk();
  console.log(chalk.green(`${prefix}${msg}`));
}

export async function logWarn(msg: string, prefix = '[chimp] ') {
  const chalk = await getChalk();
  console.log(chalk.yellow(`${prefix}${msg}`));
}

export async function logError(msg: string, prefix = '[chimp] ') {
  const chalk = await getChalk();
  console.error(chalk.red(`${prefix}${msg}`));
}

export async function logMuted(msg: string, prefix = '[chimp] ') {
  const chalk = await getChalk();
  console.log(chalk.gray(`${prefix}${msg}`));
}
