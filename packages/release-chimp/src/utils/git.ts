import { applyTagFormat } from '@chimp-stack/core/utils';
import { execSync } from 'child_process';
import fs from 'node:fs';
import path from 'node:path';

export function gitCommitTagPush(
  version: string,
  options?: {
    tagFormat?: string;
    commitMessage?: string;
    changelogPath?: string;
    skipPush?: boolean;
  } | null
) {
  try {
    const cwd = process.cwd();
    const packageJson = JSON.parse(
      fs.readFileSync(path.join(cwd, 'package.json'), 'utf-8')
    );
    const name = packageJson.name ?? '';
    const tag =
      options?.tagFormat && name
        ? applyTagFormat(options.tagFormat, name, version)
        : `v${version}`;

    const changelogFile = options?.changelogPath ?? 'CHANGELOG.md';
    if (fs.existsSync(path.join(cwd, changelogFile))) {
      execSync(`git add ${changelogFile}`, { stdio: 'inherit' });
    }

    const message =
      options?.commitMessage ?? `chore(release): ${version}`;
    execSync(`git commit -m "${message}"`, {
      stdio: 'inherit',
    });

    execSync(`git tag ${tag}`, { stdio: 'inherit' });

    if (!options?.skipPush) {
      execSync('git push', { stdio: 'inherit' });
      execSync('git push --tags', { stdio: 'inherit' });
    }
  } catch (err) {
    console.error('❌ Git operation failed. Releasing is canceled.');
    process.exit(1);
  }
}
