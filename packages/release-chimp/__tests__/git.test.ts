import {
  jest,
  describe,
  test,
  expect,
  beforeEach,
} from '@jest/globals';

const execSync = jest.fn();

// ESM-safe mock using `jest.unstable_mockModule`
jest.unstable_mockModule('child_process', () => ({
  execSync,
}));

// Import AFTER mocking
const { gitCommitTagPush } = await import('../src/utils/git.js');

describe('gitCommitTagPush', () => {
  beforeEach(() => {
    execSync.mockClear();
  });

  test('runs expected git commands', () => {
    gitCommitTagPush('1.2.3');

    expect(execSync).toHaveBeenCalledWith('git add CHANGELOG.md', {
      stdio: 'inherit',
    });
    expect(execSync).toHaveBeenCalledWith(
      'git commit -m "chore(release): 1.2.3"',
      { stdio: 'inherit' }
    );
    expect(execSync).toHaveBeenCalledWith('git tag 1.2.3', {
      stdio: 'inherit',
    });
    expect(execSync).toHaveBeenCalledWith('git push', {
      stdio: 'inherit',
    });
    expect(execSync).toHaveBeenCalledWith('git push --tags', {
      stdio: 'inherit',
    });
  });
});
