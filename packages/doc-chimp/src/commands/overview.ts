import { DocChimpConfig, loadChimpConfig } from 'chimp-core';
import fg from 'fast-glob';
import path from 'node:path';
import chalk from 'chalk';
import { FileTree, writeOutputFile } from '../utils/file.js';
import { generateMarkdownFromTree } from '../generator/markdown.js';
import { isUndocumented } from '../utils/isUndocumented.js';

export function insertIntoTree(
  tree: FileTree,
  parts: string[],
  isUndocumented: boolean
) {
  const [head, ...rest] = parts;
  if (!head) return;

  if (rest.length === 0) {
    tree[head] = {
      undocumented: isUndocumented,
    };
  } else {
    if (
      !tree[head] ||
      typeof tree[head] !== 'object' ||
      'undocumented' in tree[head]
    ) {
      tree[head] = {};
    }
    insertIntoTree(tree[head] as FileTree, rest, isUndocumented);
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

    let label = name;
    if (
      subtree &&
      'undocumented' in subtree &&
      subtree.undocumented
    ) {
      label += ' ⚠️';
    }

    if (pretty) {
      const colored =
        !subtree ||
        ('undocumented' in subtree && !subtree.undocumented)
          ? chalk.green(label)
          : chalk.red(label);
      console.log(`${prefix} ${colored}`);
    } else {
      console.log(`${prefix} ${label}`);
    }

    if (
      subtree &&
      typeof subtree === 'object' &&
      !('undocumented' in subtree)
    ) {
      printTree(subtree, depth + 1, pretty, isLast);
    }
  });
}

export async function handleOverview({
  pretty,
  undocumented,
  include: cliInclude,
  output,
  format: cliFormat,
}: {
  pretty?: boolean;
  undocumented?: boolean;
  include?: string[];
  output?: string;
  format?: string;
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
    absolute: true,
  });

  const tree: FileTree = {};

  for (const absPath of files) {
    const relPath = path.relative(process.cwd(), absPath);
    const parts = relPath.split(path.sep);

    let isUndoc = false;
    if (undocumented) {
      isUndoc = isUndocumented(absPath); // absolute path for isUndocumented check
    }

    insertIntoTree(tree, parts, isUndoc);
  }

  // Always print tree to console for interactive use
  if (pretty) {
    console.log(chalk.bold('\n📁 Project Structure Overview:\n'));
  } else {
    console.log('\n📁 Project Structure Overview:\n');
  }

  printTree(tree, 0, pretty);

  // Handle output if requested
  if (output) {
    const format = cliFormat || config.format || 'markdown';
    const outputDir = config.outputDir || 'docs';

    let outputPath: string;

    if (typeof output === 'boolean') {
      // User just wants default output filename inside configured outputDir
      const ext = format === 'markdown' ? '.md' : `.${format}`;
      outputPath = path.join(outputDir, `overview${ext}`);
    } else {
      const ext = path.extname(output);
      const endsWithSep = output.endsWith(path.sep);

      if (!ext) {
        // No extension provided
        if (endsWithSep) {
          // Treat output as a directory, write default filename inside it
          const newExt = format === 'markdown' ? '.md' : `.${format}`;
          outputPath = path.join(output, `overview${newExt}`);
        } else {
          // Treat output as a filename, add extension, no outputDir prepended
          const newExt = format === 'markdown' ? '.md' : `.${format}`;
          outputPath = output + newExt;
        }
      } else {
        // Extension provided, treat as exact file path
        outputPath = output;
      }
    }

    if (format === 'markdown') {
      const content =
        '# Project Structure Overview\n\n' +
        generateMarkdownFromTree(tree);
      writeOutputFile(outputPath, content);
      console.log(
        pretty
          ? chalk.green(`\n✅ Markdown written to ${outputPath}\n`)
          : `\n✅ Markdown written to ${outputPath}\n`
      );
    } else if (format === 'json') {
      const jsonContent = JSON.stringify(tree, null, 2);
      writeOutputFile(outputPath, jsonContent);
      console.log(
        pretty
          ? chalk.green(`\n✅ JSON written to ${outputPath}\n`)
          : `\n✅ JSON written to ${outputPath}\n`
      );
    } else {
      console.log(
        chalk.red(`❌ Unsupported output format: ${format}`)
      );
    }
  }
}
