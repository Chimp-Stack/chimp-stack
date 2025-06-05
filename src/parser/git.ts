import { simpleGit } from 'simple-git';

export async function getCommits(): Promise<string[]> {
  const git = simpleGit();
  const log = await git.log({ maxCount: 10 });
  return log.all.map((entry) => `- ${entry.message} (${entry.hash})`);
}
