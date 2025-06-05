import { writeMarkdown } from '../generator/markdown.js';
import { getCommits } from '../parser/git.js';
import { loadDocChimpConfig } from '../utils/config.js';

export async function handleOverview() {
  const config = await loadDocChimpConfig();
  const commits = await getCommits();
  const content = `# Recent Commits\n\n${commits.join('\n')}`;
  writeMarkdown('overview.md', content, config.outputDir);
  console.log('✅ doc-chimp: docs/overview.md generated.');
}
