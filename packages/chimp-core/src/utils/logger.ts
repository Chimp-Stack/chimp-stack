import { getChalk } from 'src/utils/getChalk';

export async function logInfo(msg: string) {
  const chalk = await getChalk();
  console.log(chalk.blue(`[chimp] ${msg}`));
}

export async function logSuccess(msg: string) {
  const chalk = await getChalk();
  console.log(chalk.green(`[chimp] ${msg}`));
}

export async function logWarn(msg: string) {
  const chalk = await getChalk();
  console.log(chalk.yellow(`[chimp] ${msg}`));
}

export async function logError(msg: string) {
  const chalk = await getChalk();
  console.error(chalk.red(`[chimp] ${msg}`));
}

export async function logMuted(msg: string) {
  const chalk = await getChalk();
  console.log(chalk.gray(`[chimp] ${msg}`));
}
