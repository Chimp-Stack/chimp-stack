import { execSync } from 'child_process';

export function gitCommitTagPush(version: string) {
  try {
    execSync('git add CHANGELOG.md', { stdio: 'inherit' });
    execSync(`git commit -m "chore(release): ${version}"`, {
      stdio: 'inherit',
    });
    execSync(`git tag ${version}`, { stdio: 'inherit' });
    execSync('git push', { stdio: 'inherit' });
    execSync('git push --tags', { stdio: 'inherit' });
  } catch (err) {
    console.error('❌ Git operation failed. Releasing is canceled.');
    process.exit(1);
  }
}
