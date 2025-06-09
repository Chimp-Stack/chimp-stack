import { FileTree } from '../utils/file.js';
import { writeOutputFile } from '../utils/file.js';

export function generateMarkdownFromTree(
  tree: FileTree,
  depth = 0
): string {
  const indent = '  '.repeat(depth);
  let output = '';

  const entries = Object.entries(tree).sort(([a], [b]) =>
    a.localeCompare(b)
  );

  entries.forEach(([name, subtree]) => {
    let label = name;
    if (
      subtree &&
      typeof subtree === 'object' &&
      'undocumented' in subtree &&
      subtree.undocumented
    ) {
      label += ' ⚠️';
    }

    output += `${indent}- ${label}\n`;

    if (
      subtree &&
      typeof subtree === 'object' &&
      !('undocumented' in subtree)
    ) {
      output += generateMarkdownFromTree(subtree, depth + 1);
    }
  });

  return output;
}

export function writeMarkdown(outputPath: string, content: string) {
  // Simple wrapper if you want it — optional now
  writeOutputFile(outputPath, content);
}
