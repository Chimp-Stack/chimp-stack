import type { Command } from 'commander';
import { getCurrentVersion, bumpVersion } from '../utils/version.js';
import {
  generateChangelog,
  writeChangelog,
} from '../utils/changelog.js';
import { gitCommitTagPush } from '../utils/git.js';

export async function handleBump(
  part: string,
  options: Command & { dryRun?: boolean }
) {
  const validParts = ['major', 'minor', 'patch'] as const;

  if (!validParts.includes(part as any)) {
    console.error(
      `❌ Invalid bump type: '${part}'. Must be one of: ${validParts.join(', ')}`
    );
    process.exit(1);
  }

  const current = getCurrentVersion() ?? '0.0.0';
  const next = bumpVersion(current, part as any);

  console.log(`🐵 Current version: ${current}`);
  console.log(`🍌 Next version:    ${next}`);

  const changelog = generateChangelog(next);

  if (options.dryRun) {
    console.log('\n🔍 [Dry Run] Generated changelog:\n');
    console.log(changelog);
    console.log(
      '\n✅ Dry run complete. No files written, no git commands run.'
    );
  } else {
    writeChangelog(next);
    gitCommitTagPush(next);
    console.log(`🚀 Released version ${next} and pushed to remote.`);
  }
}
