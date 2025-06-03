import chalk from 'chalk';
import fs from 'node:fs/promises';
import path from 'node:path';

export type ChimpNamespace = 'gitChimp' | 'docChimp';

export type GitChimpConfig = {
  enforceSemanticPrTitles?: boolean;
  enforceConventionalCommits?: boolean;
  model?: 'gpt-3.5-turbo' | 'gpt-4' | 'gpt-4o' | 'gpt-4o-mini';
  prMode?: 'open' | 'draft' | 'display';
  tone?:
    | 'neutral'
    | 'friendly'
    | 'sarcastic'
    | 'enthusiastic'
    | string;
  changelog?: {
    useAI?: boolean;
    groupOrder?: string[];
  };
};

export async function loadGitChimpConfig(): Promise<GitChimpConfig> {
  const chimpRcPath = path.resolve('.chimprc');
  const gitChimpRcPath = path.resolve('.git-chimprc');

  // Try .chimprc first (namespaced)
  try {
    const file = await fs.readFile(chimpRcPath, 'utf8');
    const json = JSON.parse(file);
    if (json?.gitChimp) return json.gitChimp as GitChimpConfig;
  } catch {
    /* ignore */
  }

  // Then try .git-chimprc (flat structure)
  try {
    const file = await fs.readFile(gitChimpRcPath, 'utf8');
    const json = JSON.parse(file);
    console.warn(
      chalk.yellow(
        '⚠️  .git-chimprc is deprecated. Please migrate your config to `.chimprc` under the `gitChimp` namespace.'
      )
    );
    return json as GitChimpConfig;
  } catch {
    /* ignore */
  }

  return {};
}

export async function saveGitChimpConfig(newConfig: GitChimpConfig) {
  const chimpRcPath = path.resolve('.chimprc');

  let existing: any = {};
  try {
    const file = await fs.readFile(chimpRcPath, 'utf8');
    existing = JSON.parse(file);
  } catch {
    // File doesn't exist or is empty
    existing = {};
  }

  existing.gitChimp = {
    ...(existing.gitChimp || {}),
    ...newConfig,
  };

  await fs.writeFile(
    chimpRcPath,
    JSON.stringify(existing, null, 2) + '\n'
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
