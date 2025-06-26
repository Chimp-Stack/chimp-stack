import {
  getSemanticCommits,
  loadChimpConfig,
} from '@chimp-stack/core';
import type { ReleaseChimpConfig } from '@chimp-stack/core';

export async function detectRecommendedBump(): Promise<
  'major' | 'minor' | 'patch' | null
> {
  const config = loadChimpConfig(
    'releaseChimp'
  ) as ReleaseChimpConfig;
  const scoped = config.bump?.scoped ?? false;

  const commits = await getSemanticCommits({
    scoped,
    configDir: process.cwd(),
  });

  let hasBreaking = false;
  let hasFeature = false;
  let hasFix = false;

  for (const c of commits) {
    if (c.isBreaking) {
      hasBreaking = true;
    }
    if (c.type === 'feat') {
      hasFeature = true;
    }
    if (c.type === 'fix') {
      hasFix = true;
    }
  }

  if (hasBreaking) {
    return 'major';
  }

  if (hasFeature) {
    return 'minor';
  }

  if (hasFix) {
    return 'patch';
  }

  console.warn('⚠️  No semantic commits found for bump detection.');
  return null;
}
