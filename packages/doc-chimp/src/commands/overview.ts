import { execSync } from 'node:child_process';
import { DocChimpConfig, loadChimpConfig } from '@chimp-stack/core';
import fg from 'fast-glob';
import path from 'node:path';
import chalk from 'chalk';
import { FileTree, writeOutputFile } from '../utils/file.js';
import { isUndocumented } from '../utils/isUndocumented.js';

export function insertIntoTree(
  tree: FileTree,
  parts: string[],
  isUndocumented: boolean,
  changelog?: string
) {
  const [head, ...rest] = parts;
  if (!head) return;

  if (rest.length === 0) {
    tree[head] = {
      undocumented: isUndocumented,
      changelog,
    };
  } else {
    if (
      !tree[head] ||
      typeof tree[head] !== 'object' ||
      'undocumented' in tree[head]
    ) {
      tree[head] = {};
    }
    insertIntoTree(
      tree[head] as FileTree,
      rest,
      isUndocumented,
      changelog
    );
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

function getLastCommitForFile(filePath: string): string | null {
  try {
    const result = execSync(
      `git log -1 --pretty=format:%h\\ %s -- "${filePath}"`,
      { encoding: 'utf-8' }
    );
    return result.trim();
  } catch {
    return null; // no commits or git not available
  }
}

export async function handleOverview({
  pretty,
  undocumented,
  include: cliInclude,
  output,
  format: cliFormat,
  showChangelog, // new flag here, boolean
}: {
  pretty?: boolean;
  undocumented?: boolean;
  include?: string[];
  output?: string | boolean;
  format?: string;
  showChangelog?: boolean; // add this
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

  const enableChangelog =
    showChangelog !== undefined ? showChangelog : !!config.changelog;

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
      isUndoc = isUndocumented(absPath);
    }

    let changelogEntry: string | undefined;
    if (enableChangelog) {
      const commit = getLastCommitForFile(relPath);
      if (commit) {
        changelogEntry = commit;
      }
    }

    insertIntoTree(tree, parts, isUndoc, changelogEntry);
  }

  // Print the tree with changelog info
  function printTreeWithChangelog(
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
        process.stdout.write(`${prefix} ${colored}`);
      } else {
        process.stdout.write(`${prefix} ${label}`);
      }

      // Show changelog inline, slightly indented
      if (
        subtree &&
        typeof subtree === 'object' &&
        'changelog' in subtree &&
        subtree.changelog
      ) {
        process.stdout.write(
          pretty
            ? chalk.gray(`  ← ${subtree.changelog}`)
            : `  ← ${subtree.changelog}`
        );
      }
      process.stdout.write('\n');

      if (
        subtree &&
        typeof subtree === 'object' &&
        !('undocumented' in subtree)
      ) {
        printTreeWithChangelog(subtree, depth + 1, pretty, isLast);
      }
    });
  }

  // Always print tree to console
  if (pretty) {
    console.log(chalk.bold('\n📁 Project Structure Overview:\n'));
  } else {
    console.log('\n📁 Project Structure Overview:\n');
  }
  printTreeWithChangelog(tree, 0, pretty);

  // Output handling (markdown/json)
  if (output) {
    // ... your existing output logic, with small tweaks to include changelog

    const format = cliFormat || config.format || 'markdown';
    const outputDir = config.outputDir || 'docs';

    let outputPath: string;

    if (typeof output === 'boolean') {
      const ext = format === 'markdown' ? '.md' : `.${format}`;
      outputPath = path.join(outputDir, `overview${ext}`);
    } else {
      const ext = path.extname(output);
      if (!ext) {
        const newExt = format === 'markdown' ? '.md' : `.${format}`;
        outputPath = path.join(output, `overview${newExt}`);
      } else {
        outputPath = output;
      }
      if (!path.isAbsolute(outputPath)) {
        const dirname = path.dirname(outputPath);
        if (dirname === '.' && outputDir) {
          outputPath = path.join(outputDir, outputPath);
        }
      }
    }

    if (format === 'markdown') {
      // Extend your markdown generator to add changelog info per file (basic example)
      function generateMarkdownWithChangelog(
        tree: FileTree,
        depth = 0
      ): string {
        let md = '';
        const entries = Object.entries(tree).sort(([a], [b]) =>
          a.localeCompare(b)
        );
        for (const [name, subtree] of entries) {
          const indent = '  '.repeat(depth);
          md += `${indent}- **${name}**`;
          if (
            subtree &&
            'undocumented' in subtree &&
            subtree.undocumented
          ) {
            md += ' ⚠️';
          }
          if (
            subtree &&
            typeof subtree === 'object' &&
            'changelog' in subtree &&
            subtree.changelog
          ) {
            md += `  \n${indent}  _Recent change_: \`${subtree.changelog}\``;
          }
          md += '\n';
          if (
            subtree &&
            typeof subtree === 'object' &&
            !('undocumented' in subtree)
          ) {
            md += generateMarkdownWithChangelog(subtree, depth + 1);
          }
        }
        return md;
      }

      const content =
        '# Project Structure Overview\n\n' +
        generateMarkdownWithChangelog(tree);
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
