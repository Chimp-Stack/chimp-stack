import fs from 'fs';
import path from 'path';
import os from 'os';
import { ChimpConfig } from './types/config';

const CONFIG_FILENAME = '.chimprc';

export function loadChimpConfig(scope?: string): ChimpConfig {
  const locations = [
    path.join(process.cwd(), CONFIG_FILENAME),
    path.join(os.homedir(), CONFIG_FILENAME),
  ];

  for (const loc of locations) {
    if (fs.existsSync(loc)) {
      const data = JSON.parse(fs.readFileSync(loc, 'utf-8'));
      return scope ? (data[scope] ?? {}) : data;
    }
  }

  return {};
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
