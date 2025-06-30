import fs from 'node:fs';
import path from 'node:path';
import { chimplog } from '../chimplog';

export function writeChangelogToFile(
  changelog: string,
  outputPath = 'CHANGELOG.md'
): void {
  const resolvedPath = path.resolve(process.cwd(), outputPath);
  const header = '# Changelog';
  let existing = '';

  if (fs.existsSync(resolvedPath)) {
    existing = fs.readFileSync(resolvedPath, 'utf-8');
  }

  const full = existing.startsWith(header)
    ? `${header}${changelog}\n${existing.slice(header.length)}`
    : `${header}\n${changelog}\n${existing}`;

  try {
    fs.writeFileSync(resolvedPath, `${full.trim()}\n`, 'utf-8');
  } catch (error) {
    chimplog.error(
      `❌ Failed to write changelog to ${resolvedPath}: ${error}`
    );
    throw error;
  }
}
