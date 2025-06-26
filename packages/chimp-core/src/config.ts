import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { ChimpConfig } from './types/config';

const CONFIG_FILENAME = '.chimprc';

export function loadChimpConfig(scope?: string): ChimpConfig {
  const globalPath = path.join(os.homedir(), CONFIG_FILENAME);
  const localPath = path.join(process.cwd(), CONFIG_FILENAME);

  const globalConfig = fs.existsSync(globalPath)
    ? JSON.parse(fs.readFileSync(globalPath, 'utf-8'))
    : {};

  const localConfig = fs.existsSync(localPath)
    ? JSON.parse(fs.readFileSync(localPath, 'utf-8'))
    : {};

  if (scope) {
    const { [scope]: globalScoped = {}, ...globalTopLevel } =
      globalConfig;

    const { [scope]: localScoped = {}, ...localTopLevel } =
      localConfig;

    const globalGlobals = extractGlobals(globalTopLevel);
    const localGlobals = extractGlobals(localTopLevel);

    return {
      ...globalGlobals,
      ...localGlobals,
      ...globalScoped,
      ...localScoped,
    };
  }

  // Unscoped: merge all
  return {
    ...globalConfig,
    ...localConfig,
  };
}

function extractGlobals(obj: Record<string, any>) {
  const allowed = ['openaiApiKey', 'githubToken', 'tagFormat'];
  return Object.fromEntries(
    Object.entries(obj).filter(([k]) => allowed.includes(k))
  );
}

export function writeChimpConfig(
  newConfig: ChimpConfig,
  options: { location?: 'global' | 'local'; scope?: string } = {}
) {
  const { location = 'local', scope } = options;
  const target =
    location === 'global'
      ? path.join(os.homedir(), CONFIG_FILENAME)
      : path.join(process.cwd(), CONFIG_FILENAME);

  const existing = fs.existsSync(target)
    ? JSON.parse(fs.readFileSync(target, 'utf-8'))
    : {};

  const updated = scope
    ? { ...existing, [scope]: { ...existing[scope], ...newConfig } }
    : { ...existing, ...newConfig };

  fs.writeFileSync(target, JSON.stringify(updated, null, 2));
}
