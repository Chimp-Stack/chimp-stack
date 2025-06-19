import fs from 'node:fs';
import path from 'node:path';
import { Command } from 'commander';
import { generateSemanticChangelog } from '@chimp-stack/core/utils/changelog';

export async function handleChangelog(
  options: {
    from?: string;
    to?: string;
    output?: string;
    ai?: boolean;
  } = {}
) {
  const { from, to, output, ai } = options;

  const start = from ?? (await getLatestTag()) ?? '0.0.0';
  const end = to ?? 'HEAD';

  if (!start) {
    console.error(
      '❌ No tags found to use as a starting point. Use --from manually.'
    );
    process.exit(1);
  }

  const changelog = await generateSemanticChangelog({
    from: start,
    to: end,
    toolName: 'releaseChimp',
    useAI: ai,
  });

  if (output) {
    const outputPath = path.resolve(process.cwd(), output);
    fs.appendFileSync(outputPath, changelog);
    console.log(`✅ Changelog written to ${outputPath}`);
  } else {
    console.log(changelog);
  }
}

// Helper to get the latest tag if none is provided
async function getLatestTag(): Promise<string | null> {
  const { simpleGit } = await import('simple-git');
  const git = simpleGit();
  const tags = await git.tags();
  return tags.latest ?? null;
}

// Add to CLI
export function addChangelogCommand(program: Command) {
  program
    .command('changelog')
    .description('Generate a changelog from git history')
    .option('--from <tag>', 'Start tag or commit')
    .option('--to <tag>', 'End tag or commit (default: HEAD)')
    .option('--output <file>', 'Output file to append changelog')
    .option('--ai', 'Use AI to generate a summary section')
    .action(handleChangelog);
}
