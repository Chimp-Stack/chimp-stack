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
    .action(
      async (options: {
        from?: string;
        to?: string;
        output?: string;
        ai?: boolean;
      }) => {
        const { from, to, output, ai } = options;

        const start = from ?? (await getLatestTag()) ?? '0.0.0';
        const end = to ?? 'HEAD';

        if (!start) {
          logError(
            '❌ No tags found to use as a starting point. Use --from manually.'
          );
          process.exit(1);
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
