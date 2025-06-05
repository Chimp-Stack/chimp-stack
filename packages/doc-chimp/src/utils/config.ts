import { loadChimpConfig } from 'chimp-core';
import fs from 'node:fs/promises';
import path from 'node:path';

export type DocChimpConfig = {
  include: string[];
  exclude: string[];
  outputDir: string;
  changelog: boolean;
  prSummary: boolean;
  toc: boolean;
};

export type DocChimpConfigKey = keyof DocChimpConfig;
export type DocChimpConfigValue<K extends DocChimpConfigKey> =
  DocChimpConfig[K];

export async function loadDocChimpConfig(): Promise<DocChimpConfig> {
  const chimpConfig = loadChimpConfig();
  return chimpConfig.docChimp || {};
}

export async function saveDocChimpConfig(newConfig: DocChimpConfig) {
  const chimpRcPath = path.resolve('.chimprc');

  let existing: any = {};
  try {
    const file = await fs.readFile(chimpRcPath, 'utf8');
    existing = JSON.parse(file);
  } catch {
    existing = {};
  }

  existing.docChimp = {
    ...(existing.docChimp || {}),
    ...newConfig,
  };

  await fs.writeFile(
    chimpRcPath,
    JSON.stringify(existing, null, 2) + '\n'
  );
}
