import { simpleGit } from 'simple-git';
import { Command } from 'commander';
import {
  generateSemanticChangelog,
  logError,
  logSuccess,
  writeChangelogToFile,
} from '../utils';

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
        const { from, to, output, ai, latest } = options;

        // const start = from ?? (await getLatestTag()) ?? '0.0.0';
        let start = from;
        let end = to ?? 'HEAD';

        if (latest) {
          const tags = await getSortedTags();
          if (tags.length === 0) {
            logError('❌ No tags found in this repository.');
            process.exit(1);
          }

          end = tags[0];
          start = tags[1] ?? '0.0.0';
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

async function getSortedTags(): Promise<string[]> {
  const git = simpleGit();
  const tags = await git.tags();
  return tags.all.sort((a, b) => {
    // fallback to semantic sort
    return b.localeCompare(a, undefined, {
      numeric: true,
      sensitivity: 'base',
    });
  });
}
