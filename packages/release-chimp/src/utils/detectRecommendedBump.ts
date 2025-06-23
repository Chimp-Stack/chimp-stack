import { Bumper } from 'conventional-recommended-bump';
import { loadChimpConfig } from '@chimp-stack/core';
import type { ReleaseChimpConfig } from '@chimp-stack/core';

export async function detectRecommendedBump(): Promise<
  'major' | 'minor' | 'patch' | null
> {
  const config = loadChimpConfig(
    'releaseChimp'
  ) as ReleaseChimpConfig;
  const preset = config.bump?.preset || 'conventionalcommits';

  try {
    const bumper = new Bumper().loadPreset(preset);
    const result = await bumper.bump();

    if (typeof result === 'object' && 'releaseType' in result) {
      const type = result.releaseType;
      if (type === 'major' || type === 'minor' || type === 'patch') {
        return type;
      }
    }

    console.warn('⚠️  Unable to determine bump type from commits.');
    return null;
  } catch (error) {
    console.log('❌ Failed to detect recommended bump:', error);
    return null;
  }
}
