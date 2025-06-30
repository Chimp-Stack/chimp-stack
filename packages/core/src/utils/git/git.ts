import { simpleGit } from 'simple-git';
import fs from 'node:fs';
import path from 'node:path';

type DetectVersionResult = {
  version: string;
  isGitRef: boolean;
};

export async function detectCurrentVersion({
  cwd = process.cwd(),
  tagFormat,
}: {
  cwd?: string;
  tagFormat?: string;
}): Promise<DetectVersionResult> {
  const git = simpleGit(cwd);
  const tags = await git.tags();

  const verifyRefExists = async (ref: string): Promise<boolean> => {
    try {
      await git.revparse([`${ref}^{}`]);
      return true;
    } catch {
      return false;
    }
  };

  if (tagFormat) {
    const regex = tagFormatToRegex(tagFormat);
    const matchingTags = tags.all.filter((tag) => regex.test(tag));
    const latest = matchingTags.at(-1);
    if (latest && (await verifyRefExists(latest))) {
      return { version: latest, isGitRef: true };
    }
  }

  const packageJsonPath = path.join(cwd, 'package.json');
  const pkg = fs.existsSync(packageJsonPath)
    ? JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'))
    : null;

  const name = pkg?.name;

  if (name) {
    const scopedRegex = new RegExp(
      `^${escapeRegex(name)}@\\d+\\.\\d+\\.\\d+$`
    );
    const scoped = tags.all
      .filter((tag) => scopedRegex.test(tag))
      .at(-1);
    if (scoped && (await verifyRefExists(scoped))) {
      return { version: scoped, isGitRef: true };
    }
  }

  const semverRegex = /^v?\d+\.\d+\.\d+$/;
  const plain = tags.all.filter((t) => semverRegex.test(t)).at(-1);
  if (plain && (await verifyRefExists(plain))) {
    return { version: plain, isGitRef: true };
  }

  if (pkg?.version) {
    return { version: pkg.version, isGitRef: false };
  }

  return { version: '0.0.0', isGitRef: false };
}

// Helper to convert a tagFormat like '%name@v%' into a regex
export function tagFormatToRegex(format: string): RegExp {
  const regexString = format
    .replace(/\$\{name\}/g, '.+')
    .replace(/\$\{version\}/g, '\\d+\\.\\d+\\.\\d+')
    .replace(/\./g, '\\.');
  return new RegExp(`^${regexString}$`);
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function extractVersionFromTag(tag: string): string {
  const match = tag.match(/(\d+\.\d+\.\d+)$/);
  if (!match) {
    throw new Error(`Could not extract version from tag: ${tag}`);
  }
  return match[1];
}

export function filterDiff(diff: string): string {
  const IGNORED_PATHS = [
    'package-lock.json',
    'yarn.lock',
    'pnpm-lock.yaml',
    'bun.lockb',
    'CHANGELOG.md',
    '.env',
    '.DS_Store',
  ];

  const lines = diff.split('\n');
  const filtered: string[] = [];

  let include = true;
  for (const line of lines) {
    if (line.startsWith('diff --git')) {
      const filePath = line.split(' b/')[1];
      include = !IGNORED_PATHS.some((ignored) =>
        filePath?.includes(ignored)
      );
    }

    if (include) filtered.push(line);
  }

  return filtered.join('\n');
}
