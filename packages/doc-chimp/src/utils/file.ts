import fs from 'node:fs';
import path from 'node:path';

export type FileTree = {
  [key: string]: FileTree | null | { undocumented: boolean };
};

export function writeOutputFile(filePath: string, content: string) {
  const dir = path.dirname(filePath);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(filePath, content, 'utf-8');
}
