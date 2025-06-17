import { execSync } from 'child_process';

export type VersionPart = 'major' | 'minor' | 'patch';

export function getCurrentVersion(): string | null {
  try {
    const tags = execSync('git tag --list --sort=-v:refname', {
      encoding: 'utf8',
    })
      .split('\n')
      .map((tag) => tag.trim())
      .filter((tag) => /^\d+\.\d+\.\d+$/.test(tag));

    return tags[0] || null;
  } catch (error) {
    console.error('Error reading git tags:', error);
    return null;
  }
}

export function bumpVersion(
  version: string,
  part: VersionPart
): string {
  const [major, minor, patch] = version.split('.').map(Number);

  switch (part) {
    case 'major':
      return `${major + 1}.0.0`;
    case 'minor':
      return `${major}.${minor + 1}.0`;
    case 'patch':
      return `${major}.${minor}.${patch + 1}`;
    default:
      throw new Error(`Invalid version bump type: ${part}`);
  }
}
