import type { Command } from 'commander';
import fs from 'node:fs';
import path from 'node:path';
import { getCurrentVersion, bumpVersion } from '../utils/version.js';
import {
  generateChangelog,
  writeChangelog,
} from '../utils/changelog.js';
import { gitCommitTagPush } from '../utils/git.js';

export async function handleBump(
  part: string,
  options: Command & {
    dryRun?: boolean;
    noPackageJson?: boolean;
    noChangelog?: boolean;
    noGit?: boolean;
  }
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

  if (options.dryRun) {
    const changelog = options.noChangelog
      ? '_Changelog generation skipped (dry run)._'
      : generateChangelog(next);

    console.log('\n🔍 [Dry Run] Preview:\n');
    if (!options.noPackageJson) {
      console.log(`📦 Would update package.json version to ${next}`);
    } else {
      console.log('📦 Skipping package.json update');
    }
    console.log(changelog);
    if (!options.noGit) {
      console.log(`🔧 Would commit, tag, and push version ${next}`);
    } else {
      console.log('🔧 Skipping git commit/tag/push');
    }
    console.log(
      '\n✅ Dry run complete. No files written, no git commands run.'
    );
    return;
  }

  // Write package.json version bump unless opted out
  if (!options.noPackageJson) {
    const packageJsonPath = path.resolve(
      process.cwd(),
      'package.json'
    );
    if (!fs.existsSync(packageJsonPath)) {
      console.warn(
        '⚠️  package.json not found, skipping version update.'
      );
    } else {
      const pkg = JSON.parse(
        fs.readFileSync(packageJsonPath, 'utf-8')
      );
      pkg.version = next;
      fs.writeFileSync(
        packageJsonPath,
        JSON.stringify(pkg, null, 2) + '\n',
        'utf-8'
      );
      console.log(`📦 Updated package.json to version ${next}`);
    }
  } else {
    console.log('📦 Skipping package.json update');
  }

  // Generate and write changelog unless opted out
  if (!options.noChangelog) {
    writeChangelog(next);
    console.log('📝 Changelog updated');
  } else {
    console.log('📝 Skipping changelog update');
  }

  // Commit, tag, and push unless opted out
  if (!options.noGit) {
    gitCommitTagPush(next);
    console.log(`🚀 Released version ${next} and pushed to remote.`);
  } else {
    console.log('🚀 Skipping git commit, tag, and push');
  }
}
