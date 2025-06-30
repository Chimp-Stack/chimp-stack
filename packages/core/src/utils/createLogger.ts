import { chalk } from './chalk';

export type Logger = {
  info: (msg: string) => void;
  success: (msg: string) => void;
  warn: (msg: string) => void;
  error: (msg: string) => void;
  muted: (msg: string) => void;
};

export const createLogger = (prefix: string): Logger => ({
  info: (msg: string) => console.log(chalk.blue(`${prefix} ${msg}`)),
  success: (msg: string) =>
    console.log(chalk.green(`${prefix} ${msg}`)),
  warn: (msg: string) =>
    console.log(chalk.yellow(`${prefix} ${msg}`)),
  error: (msg: string) =>
    console.error(chalk.red(`${prefix} ${msg}`)),
  muted: (msg: string) => console.log(chalk.gray(`${prefix} ${msg}`)),
});
