import { DocChimpConfig, loadChimpConfig } from 'chimp-core';
import fg from 'fast-glob';
import path from 'node:path';
import chalk from 'chalk';

type FileTree = {
  [key: string]: FileTree | null;
};

export function insertIntoTree(tree: FileTree, parts: string[]) {
  const [head, ...rest] = parts;
  if (!head) return;

  if (rest.length === 0) {
    tree[head] = null;
  } else {
    if (!tree[head] || tree[head] === null) {
      tree[head] = {};
    }
    insertIntoTree(tree[head] as FileTree, rest);
  }
}

function printTree(
  tree: FileTree,
  depth = 0,
  pretty = false,
  parentIsLast = true
) {
  const indent = '  '.repeat(depth);
  const entries = Object.entries(tree).sort(([a], [b]) =>
    a.localeCompare(b)
  );
  const lastIndex = entries.length - 1;

  entries.forEach(([name, subtree], i) => {
    const isLast = i === lastIndex;
    const prefix =
      depth === 0 ? '' : `${indent}${isLast ? '└─' : '├─'}`;
    const label = subtree ? `${name}/` : name;

    if (pretty) {
      const colored =
        subtree === null
          ? chalk.green(label)
          : chalk.blue.bold(label);
      console.log(`${prefix} ${colored}`);
    } else {
      console.log(`${prefix} ${label}`);
    }

    if (subtree) {
      printTree(subtree, depth + 1, pretty, isLast);
    }
  });
}

export async function handleOverview({
  pretty,
  include: cliInclude,
}: {
  pretty?: boolean;
  include?: string[];
}) {
  const config = loadChimpConfig('docChimp') as DocChimpConfig;

  function expandIncludePatterns(patterns: string[]): string[] {
    return patterns.flatMap((p) =>
      p.endsWith('/') || !p.includes('*')
        ? [p, path.join(p, '**', '*')]
        : [p]
    );
  }

  const include = expandIncludePatterns(
    cliInclude?.length ? cliInclude : config.include
  );
  const exclude = config.exclude;

  const files = await fg(include, {
    ignore: exclude,
    onlyFiles: true,
    cwd: process.cwd(),
    absolute: false,
  });

  const tree: FileTree = {};

  for (const relPath of files) {
    const parts = relPath.split(path.sep);
    insertIntoTree(tree, parts);
  }

  if (pretty) {
    console.log(chalk.bold('\n📁 Project Structure Overview:\n'));
  } else {
    console.log('\n📁 Project Structure Overview:\n');
  }

  printTree(tree, 0, pretty);
}
