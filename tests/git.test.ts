import { getCommits } from '../src/parser/git.js';

describe('getCommits', () => {
  it('should return an array of commits', async () => {
    const commits = await getCommits();
    expect(commits.length).toBeGreaterThan(0);
    expect(commits[0]).toContain('-');
  });
});
