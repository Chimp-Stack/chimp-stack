import fs from 'fs';
import path from 'path';
import os from 'os';

export interface ChimpConfig {
  openaiApiKey?: string;
  [key: string]: any;
}

const CONFIG_FILENAME = '.chimprc';

export function loadChimpConfig(): ChimpConfig {
  const locations = [
    path.join(process.cwd(), CONFIG_FILENAME),
    path.join(os.homedir(), CONFIG_FILENAME),
  ];

  for (const loc of locations) {
    if (fs.existsSync(loc)) {
      const data = fs.readFileSync(loc, 'utf-8');
      return JSON.parse(data);
    }
  }

  return {};
}

export function writeChimpConfig(
  config: ChimpConfig,
  location: 'global' | 'local' = 'local'
) {
  const target =
    location === 'global'
      ? path.join(os.homedir(), CONFIG_FILENAME)
      : path.join(process.cwd(), CONFIG_FILENAME);
  fs.writeFileSync(target, JSON.stringify(config, null, 2));
}
