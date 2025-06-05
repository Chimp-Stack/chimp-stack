import { DocChimpConfig, loadChimpConfig } from 'chimp-core';
import { writeMarkdown } from '../generator/markdown.js';
import { getCommits } from '../parser/git.js';

export async function handleOverview() {
  const config = loadChimpConfig('docChimp') as DocChimpConfig;
  const commits = await getCommits();
  const content = `# Recent Commits\n\n${commits.join('\n')}`;
  writeMarkdown('overview.md', content, config.outputDir);
  console.log('✅ doc-chimp: docs/overview.md generated.');
}
