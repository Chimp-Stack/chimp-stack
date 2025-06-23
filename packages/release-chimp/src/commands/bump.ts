import type { Command } from 'commander';
import fs from 'node:fs';
import path from 'node:path';
import { bumpVersion } from '../utils/version.js';
import {
  generateSemanticChangelog,
  writeChangelogToFile,
} from '@chimp-stack/core/utils/changelog';
import { gitCommitTagPush } from '../utils/git.js';
import {
  detectCurrentVersion,
  extractVersionFromTag,
} from '@chimp-stack/core/utils';
import {
  loadChimpConfig,
  ReleaseChimpConfig,
} from '@chimp-stack/core';

export async function handleBump(
  cliPart: string,
  cliOptions: Command & {
    ai?: boolean;
    ci?: boolean;
    dryRun?: boolean;
    noPackageJson?: boolean;
    noChangelog?: boolean;
    noGit?: boolean;
    output?: string;
  }
) {
  const config = loadChimpConfig(
    'releaseChimp'
  ) as ReleaseChimpConfig;

  const dryRun = cliOptions.dryRun ?? config.dryRun ?? false;
  const part = cliPart || config.bumpType || 'patch';
  console.log('📦 Bump type: %s', part);

  const inferVersionOnly = cliPart === undefined && !dryRun;
  const isCI = cliOptions.ci ?? false;

  if (isCI) {
    console.log(
      '🤖 CI mode enabled. Commit messages will include [skip ci]. Use --no-xyz flags to control what gets skipped.'
    );
  }

  const noPackageJson =
    cliOptions.noPackageJson ?? config.noPackageJson ?? false;
  const noChangelog =
    cliOptions.noChangelog ?? config.noChangelog ?? false;
  const noGit = cliOptions.noGit ?? config.noGit ?? false;
  const useAI = cliOptions.ai ?? config.changelog?.useAI ?? false;
  const outputFormat = cliOptions.output ?? 'text';

  const validParts = ['major', 'minor', 'patch'] as const;

  if (!validParts.includes(part as any)) {
    console.error(
      `❌ Invalid bump type: '${part}'. Must be one of: ${validParts.join(', ')}`
    );
    process.exit(1);
  }

  const { version: current, isGitRef } = await detectCurrentVersion({
    tagFormat: config.tagFormat,
  });

  const rawVersion = extractVersionFromTag(current);
  const next = inferVersionOnly
    ? rawVersion
    : bumpVersion(rawVersion, part as any);

  console.log(`🐵 Current version: ${current}`);
  console.log(`🍌 Next version:    ${next}`);

  if (inferVersionOnly) {
    console.log(
      `🔄 No bump type specified. Inferring version from latest tag.`
    );
  }

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

  // Update package.json version
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

  // Generate
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
    gitCommitTagPush(next, {
      tagFormat: config.tagFormat,
      commitMessage: isCI
        ? `chore(release): ${next} [skip ci]`
        : `chore(release): ${next}`,
      changelogPath: config.changelog?.path ?? 'CHANGELOG.md',
    });
    console.log(`🚀 Released version ${next} and pushed to remote.`);
  } else {
    console.log('🚀 Skipping git commit, tag, and push');
  }

  if (outputFormat === 'json') {
    console.log(JSON.stringify({ next }, null, 2));
  } else {
    console.log(next);
  }
}
