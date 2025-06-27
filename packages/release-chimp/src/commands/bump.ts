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
  applyTagFormat,
  detectCurrentVersion,
  extractVersionFromTag,
} from '@chimp-stack/core/utils';
import {
  loadChimpConfig,
  ReleaseChimpConfig,
} from '@chimp-stack/core';
import { detectRecommendedBump } from '../utils/detectRecommendedBump.js';

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
    cwd?: string;
  }
) {
  // Change directory if needed
  if (cliOptions.cwd) {
    try {
      process.chdir(cliOptions.cwd);
      console.log(
        `🧭 Changed working directory to ${cliOptions.cwd}`
      );
    } catch (err) {
      console.error(
        `❌ Failed to change directory: ${cliOptions.cwd}`,
        err
      );
      process.exit(1);
    }
  }

  const config = loadChimpConfig(
    'releaseChimp'
  ) as ReleaseChimpConfig;
  const dryRun = cliOptions.dryRun ?? config.dryRun ?? false;
  const isCI = cliOptions.ci ?? false;

  // Determine bump part
  let part = cliPart || config.bumpType || null;
  let inferredFromCommits = false;

  if (!part) {
    part = await detectRecommendedBump();
    if (part) {
      console.log(`📦 Bump type auto-detected as: ${part}`);
      inferredFromCommits = true;
    } else {
      if (isCI) {
        console.log(
          '⚠️  No semantic commits found. CI mode: skipping bump.'
        );
        process.exit(0); // Graceful exit — no bump needed
      } else {
        console.log('📦 Falling back to patch version bump');
        part = 'patch';
      }
    }
  }

  const validParts = ['major', 'minor', 'patch'] as const;
  if (!validParts.includes(part as any)) {
    console.error(
      `❌ Invalid bump type: '${part}'. Must be one of: ${validParts.join(', ')}`
    );
    process.exit(1);
  }

  const inferVersionOnly = cliPart === undefined && !dryRun;

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

  const { version: current, isGitRef } = await detectCurrentVersion({
    tagFormat: config.tagFormat,
  });

  const rawVersion = extractVersionFromTag(current);
  const next = inferVersionOnly
    ? rawVersion
    : bumpVersion(rawVersion, part as any);

  console.log(`🐵 Current version: ${current}`);
  console.log(`🍌 Next version:    ${next}`);
  console.log('📦 Bump type: %s', part);
  if (inferredFromCommits) {
    console.log('🔍 Bump type auto-detected from commit history');
  }

  if (next === rawVersion) {
    console.log(
      `⚠️  Version '${next}' is already published or no bump needed. Exiting.`
    );
    process.exit(0);
  }

  if (inferVersionOnly) {
    console.log(
      `🔄 No bump type specified. Inferring version from latest tag.`
    );
  }

  // Load package.json data
  const pkgPath = path.resolve(process.cwd(), 'package.json');
  const hasPkg = fs.existsSync(pkgPath);
  const pkg = hasPkg
    ? JSON.parse(fs.readFileSync(pkgPath, 'utf-8'))
    : {};
  const name = pkg.name;

  // Determine tag name
  const tag =
    config?.tagFormat && name
      ? applyTagFormat(config.tagFormat, name, next)
      : `v${next}`;
  const includeNameInCommit = config.includeNameInCommit ?? true;
  const commitMessage = isCI
    ? `chore(release): ${includeNameInCommit && name ? `${name} ` : ''}${next} [skip ci]`
    : `chore(release): ${includeNameInCommit && name ? `${name} ` : ''}${next}`;

  // Generate changelog or skip
  const changelog = noChangelog
    ? '_Changelog generation skipped._'
    : await generateSemanticChangelog({
        from: isGitRef ? current : undefined,
        to: 'HEAD',
        toolName: 'releaseChimp',
        useAI,
      });

  if (dryRun) {
    console.log('\n🔍 [Dry Run] Preview:\n');
    if (!noPackageJson)
      console.log(`📦 Would update package.json version to ${next}`);
    else console.log('📦 Skipping package.json update');

    if (!noChangelog) {
      console.log(
        `📝 Would write changelog to ${config.changelog?.path ?? 'CHANGELOG.md'}`
      );
      console.log('📝 Changelog preview:');
      console.log(changelog);
    } else {
      console.log('📝 Skipping changelog update');
    }

    if (!noGit) {
      console.log(`🔧 Would stage:`);
      if (!noPackageJson) console.log('  - package.json');
      if (!noChangelog)
        console.log(
          `  - ${config.changelog?.path ?? 'CHANGELOG.md'}`
        );
      console.log(`🔧 Would commit with message: "${commitMessage}"`);
      console.log(`🏷️  Would tag: ${tag}`);
      console.log('🚀 Would push to remote');
    } else {
      console.log('🔧 Skipping git commit/tag/push');
    }

    console.log(
      '\n✅ Dry run complete. No files written, no git commands run.'
    );
    return;
  }

  // Actual bump and release
  if (!noPackageJson) {
    if (!hasPkg) {
      console.warn(
        '⚠️  package.json not found, skipping version update.'
      );
    } else {
      pkg.version = next;
      fs.writeFileSync(
        pkgPath,
        JSON.stringify(pkg, null, 2) + '\n',
        'utf-8'
      );
      console.log(`📦 Updated package.json to version ${next}`);
    }
  } else {
    console.log('📦 Skipping package.json update');
  }

  if (!noChangelog) {
    try {
      writeChangelogToFile(changelog, config.changelog?.path);
      console.log('📝 Changelog updated');
    } catch {
      console.error('❌ Failed to write changelog');
      process.exit(1);
    }
  } else {
    console.log('📝 Skipping changelog update');
  }

  if (!noGit) {
    gitCommitTagPush(next, {
      tagFormat: config.tagFormat,
      commitMessage,
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
