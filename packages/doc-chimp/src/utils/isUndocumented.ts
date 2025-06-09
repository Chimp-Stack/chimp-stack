import fs from 'node:fs';

export function isUndocumented(fullPath: string): boolean {
  try {
    const content = fs.readFileSync(fullPath, 'utf-8');
    const hasMeaningfulDocComment = content.match(
      /\/\*\*[^*][\s\S]*?\*\//
    );
    return !hasMeaningfulDocComment;
  } catch (err) {
    console.warn(`⚠️ Could not read file: ${fullPath}`);
    return false;
  }
}
