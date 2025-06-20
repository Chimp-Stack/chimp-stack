import { simpleGit } from 'simple-git';
import fs from 'node:fs';
import { Command } from 'commander';
import {
  extractTagPrefixFromFormat,
  generateSemanticChangelog,
  logError,
  logSuccess,
  writeChangelogToFile,
} from '../utils';
import { loadChimpConfig } from 'src/config';

export function addChangelogCommand(
  program: Command,
  toolName: 'gitChimp' | 'releaseChimp'
) {
  program
    .command('changelog')
    .description('Generate a changelog from git history')
    .option('--from <tag>', 'Start tag or commit')
    .option('--to <tag>', 'End tag or commit (default: HEAD)')
    .option('--output <file>', 'Output file to append changelog')
    .option('--ai', 'Use AI to generate a summary section')
    .option(
      '--latest',
      'Generate changelog between the last two tags'
    )
    .action(
      async (options: {
        from?: string;
        to?: string;
        output?: string;
        ai?: boolean;
        latest?: boolean;
      }) => {
        const config = loadChimpConfig(toolName);
        const tagFormat = config.tagFormat || '';
        const { from, to, output, ai, latest } = options;

        let start = from;
        let end = to ?? 'HEAD';

        if (latest) {
          const pkgJson = JSON.parse(
            fs.readFileSync('package.json', 'utf8')
          );
          const name = pkgJson.name;
          const tags = await getSortedTags(tagFormat, name);
          if (tags.length === 0) {
            logError('❌ No tags found in this repository.');
            process.exit(1);
          }

          end = tags[0];
          start = tags[1] ?? '0.0.0';

          console.log(
            `🪵 Generating changelog from ${start} → ${end}`
          );
        }

        if (!start) {
          start = (await getLatestTag()) ?? '0.0.0';
          if (!start) {
            logError('❌ No starting tag or commit specified.');
            process.exit(1);
          }
        }

        const changelog = await generateSemanticChangelog({
          from: start,
          to: end,
          toolName,
          useAI: ai,
        });

        if (output) {
          const outputPath = process.cwd() + '/' + output;
          try {
            writeChangelogToFile(changelog, outputPath);
            logSuccess(`✅ Changelog written to ${outputPath}`);
          } catch (_) {
            process.exit(1);
          }
        } else {
          console.log(changelog);
        }
      }
    );
}

async function getLatestTag(): Promise<string | null> {
  const git = simpleGit();
  const tags = await git.tags();
  return tags.latest ?? null;
}

async function getSortedTags(
  tagPrefix?: string,
  name?: string
): Promise<string[]> {
  const git = simpleGit();
  const tags = await git.tags();

  let prefix = '';
  if (tagPrefix && name) {
    prefix = extractTagPrefixFromFormat(tagPrefix, name);
  }

  const filtered = tagPrefix
    ? tags.all.filter((tag) => tag.startsWith(prefix))
    : tags.all;

  return filtered.sort((a, b) => {
    // fallback to semantic sort
    return b.localeCompare(a, undefined, {
      numeric: true,
      sensitivity: 'base',
    });
  });
}
