import { DocChimpConfig, loadChimpConfig } from 'chimp-core';
import fg from 'fast-glob';
import path from 'node:path';
import chalk from 'chalk';

export async function handleOverview({
  pretty,
}: {
  pretty?: boolean;
}) {
  const config = loadChimpConfig('docChimp') as DocChimpConfig;
  const { include, exclude, outputDir } = config;

  const files = await fg(include, {
    ignore: exclude,
    onlyFiles: true,
    cwd: process.cwd(),
    absolute: true,
  });

  const tree: Record<string, string[]> = {};

  for (const file of files) {
    const relPath = path.relative(process.cwd(), file);
    const dir = path.dirname(relPath);

    if (!tree[dir]) {
      tree[dir] = [];
    }

    tree[dir].push(path.basename(relPath));
  }

  if (pretty) {
    console.log(chalk.bold('\n📁 Project Structure Overview:\n'));
  } else {
    console.log('\n📁 Project Structure Overview:\n');
  }

  const printTree = (dir: string, depth = 0) => {
    const indent = '  '.repeat(depth);
    const label = dir || '.';

    if (pretty) {
      console.log(`${indent}${chalk.blue.bold(label + '/')}`);
    } else {
      console.log(`${indent}${label}/`);
    }

    const children = (tree[dir] || []).sort();

    for (const child of children) {
      const childText = `${indent}  └── ${child}`;
      console.log(pretty ? chalk.green(childText) : childText);
    }

    const subdirs = Object.keys(tree)
      .filter((d) => path.dirname(d) === dir && d !== dir)
      .sort();

    for (const sub of subdirs) {
      printTree(sub, depth + 1);
    }
  };

  printTree('');
}
