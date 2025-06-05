import path from 'node:path';
import { describe, expect, it } from '@jest/globals';
import { insertIntoTree } from '../src/commands/overview.js';

type FileTree = {
  [key: string]: FileTree | null;
};

function generateTreeRepresentation(
  tree: FileTree,
  depth = 0
): string[] {
  const result: string[] = [];
  const entries = Object.entries(tree).sort(([a], [b]) =>
    a.localeCompare(b)
  );
  for (let i = 0; i < entries.length; i++) {
    const [name, subtree] = entries[i];
    const prefix =
      '  '.repeat(depth) + (i === entries.length - 1 ? '└─' : '├─');
    result.push(subtree ? `${prefix} ${name}/` : `${prefix} ${name}`);
    if (subtree) {
      result.push(...generateTreeRepresentation(subtree, depth + 1));
    }
  }
  return result;
}

describe('insertIntoTree', () => {
  it('creates a nested tree structure from file paths', () => {
    const mockPaths = [
      'packages/doc-chimp/src/index.ts',
      'packages/doc-chimp/src/utils/helper.ts',
      'packages/doc-chimp/README.md',
      'packages/git-chimp/src/main.ts',
      'packages/README.md',
    ];

    const tree: FileTree = {};

    for (const file of mockPaths) {
      const parts = file.split(path.sep);
      insertIntoTree(tree, parts);
    }

    const output = generateTreeRepresentation(tree);

    expect(output).toEqual([
      '└─ packages/',
      '  ├─ doc-chimp/',
      '    ├─ README.md',
      '    └─ src/',
      '      ├─ index.ts',
      '      └─ utils/',
      '        └─ helper.ts',
      '  ├─ git-chimp/',
      '    └─ src/',
      '      └─ main.ts',
      '  └─ README.md',
    ]);
  });
});
