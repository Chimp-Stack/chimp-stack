import type { Command } from 'commander';
import fs from 'node:fs';
import path from 'node:path';
import { bumpVersion } from '../utils/version.js';
import {
  generateSemanticChangelog,
  writeChangelogToFile,
} from '@chimp-stack/core/utils/changelog';
import { gitCommitTagPush } from '../utils/git.js';
import { detectCurrentVersion } from '@chimp-stack/core/utils';
import {
  loadChimpConfig,
  ReleaseChimpConfig,
} from '@chimp-stack/core';

export async function handleBump(
  cliPart: string,
  cliOptions: Command & {
    ai?: boolean;
    dryRun?: boolean;
    noPackageJson?: boolean;
    noChangelog?: boolean;
    noGit?: boolean;
  }
) {
  const config = loadChimpConfig(
    'releaseChimp'
  ) as ReleaseChimpConfig;

  const part = cliPart || config.bumpType || 'patch';
  const dryRun = cliOptions.dryRun ?? config.dryRun ?? false;
  const noPackageJson =
    cliOptions.noPackageJson ?? config.noPackageJson ?? false;
  const noChangelog =
    cliOptions.noChangelog ?? config.noChangelog ?? false;
  const noGit = cliOptions.noGit ?? config.noGit ?? false;

  const validParts = ['major', 'minor', 'patch'] as const;

  const useAI = cliOptions.ai ?? config.changelog?.useAI ?? false;

  if (!validParts.includes(part as any)) {
    console.error(
      `❌ Invalid bump type: '${part}'. Must be one of: ${validParts.join(', ')}`
    );
    process.exit(1);
  }

  const { version: current, isGitRef } = await detectCurrentVersion({
    tagFormat: config.tagFormat,
  });

  const next = bumpVersion(current, part as any);

  console.log(`🐵 Current version: ${current}`);
  console.log(`🍌 Next version:    ${next}`);

  if (dryRun) {
    const changelog = noChangelog
      ? '_Changelog generation skipped (dry run)._'
      : await generateSemanticChangelog({
          from: isGitRef ? current : undefined,
          to: 'HEAD',
          toolName: 'releaseChimp',
          useAI,
        });

    console.log('\n🔍 [Dry Run] Preview:\n');
    if (!noPackageJson) {
      console.log(`📦 Would update package.json version to ${next}`);
    } else {
      console.log('📦 Skipping package.json update');
    }
    console.log(changelog);
    if (!noGit) {
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
  if (!noPackageJson) {
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
  if (!noChangelog) {
    const changelog = await generateSemanticChangelog({
      from: isGitRef ? current : undefined,
      to: 'HEAD',
      toolName: 'releaseChimp',
      useAI,
    });

    try {
      writeChangelogToFile(changelog);
      console.log('📝 Changelog updated');
    } catch (error) {
      console.error(`❌ Failed to write changelog`);
      process.exit(1);
    }
  } else {
    console.log('📝 Skipping changelog update');
  }

  // Commit, tag, and push unless opted out
  if (!noGit) {
    gitCommitTagPush(next);
    console.log(`🚀 Released version ${next} and pushed to remote.`);
  } else {
    console.log('🚀 Skipping git commit, tag, and push');
  }
}
