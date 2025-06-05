import chalk from 'chalk';
import { GitChimpConfig } from 'chimp-core';

export function guessSemanticPrefix(diff: string): string {
  const lowerDiff = diff.toLowerCase();

  if (lowerDiff.includes('fix') || lowerDiff.includes('bug')) {
    return 'fix';
  }
  if (
    lowerDiff.includes('add') ||
    lowerDiff.includes('new feature')
  ) {
    return 'feat';
  }
  if (lowerDiff.includes('refactor')) {
    return 'refactor';
  }
  if (lowerDiff.includes('test') || lowerDiff.includes('jest')) {
    return 'test';
  }
  if (lowerDiff.includes('doc') || lowerDiff.includes('readme')) {
    return 'docs';
  }
  if (lowerDiff.includes('style')) {
    return 'style';
  }

  // Fall back to 'chore' if nothing matches
  return 'chore';
}

export function isConventionalCommit(msg: string): boolean {
  return /^(feat|fix|chore|docs|style|refactor|perf|test)(\([\w\-]+\))?: .+/.test(
    msg
  );
}

export function isSemanticPrTitle(title: string): boolean {
  return /^(feat|fix|chore|docs|style|refactor|perf|test)(\(.*\))?: .+/.test(
    title
  );
}

export function validatePrTitle(
  title: string,
  config: GitChimpConfig,
  opts: { throwOnError?: boolean } = {}
): boolean {
  const isValid = isSemanticPrTitle(title);

  if (!isValid && config.enforceSemanticPrTitles) {
    const msg = `❌ PR title "${title}" is not semantic. Expected something like "feat: Add login support"`;
    if (opts.throwOnError) {
      throw new Error(msg);
    } else {
      console.warn(chalk.yellow(msg));
    }
  }

  return isValid;
}
