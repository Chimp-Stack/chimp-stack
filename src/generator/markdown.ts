import fs from 'fs';
import path from 'path';

export function writeMarkdown(
  fileName: string,
  content: string,
  outputDir: string
) {
  const fullPath = path.join(outputDir, fileName);
  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(fullPath, content, 'utf-8');
}
