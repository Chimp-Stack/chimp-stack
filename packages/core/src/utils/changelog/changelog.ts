import type {
  GitChimpConfig,
  ReleaseChimpConfig,
} from '../../types/config.js';
import { generateChangelogEntries } from '../openai.js';
import { loadChimpConfig } from '../../config.js';
import { getSemanticCommits } from '../git/getSemanticCommits.js';

type ChangelogConfig = GitChimpConfig | ReleaseChimpConfig;

export async function generateSemanticChangelog({
  from,
  to = 'HEAD',
  toolName,
  useAI = false,
}: {
  from?: string;
  to?: string;
  toolName: 'gitChimp' | 'releaseChimp';
  useAI?: boolean;
}): Promise<string> {
  const config = loadChimpConfig(toolName) as ChangelogConfig;
  const scoped = config.changelog?.scoped ?? false;
  const commits = await getSemanticCommits({
    from,
    to,
    scoped,
    configDir: process.cwd(),
  });

  if (commits.length === 0) {
    return `## Changelog (${from ?? 'initial'} → ${to})\n\n_No commits found._\n`;
  }

  // 🧠 Group by type
  const semanticGroups: Record<string, string[]> = {};
  for (const c of commits) {
    if (!semanticGroups[c.type]) semanticGroups[c.type] = [];
    semanticGroups[c.type].push(c.description);
  }

  let output = `## Changelog (${from ?? 'initial'} → ${to})\n\n`;

  const groupOrder = config?.changelog?.groupOrder || [
    'feat',
    'fix',
    'refactor',
    'perf',
    'docs',
    'test',
    'chore',
  ];

  for (const type of groupOrder) {
    if (semanticGroups[type]?.length) {
      output += `### ${getSectionTitle(type)}\n`;
      for (const desc of semanticGroups[type]) {
        output += `- ${desc}\n`;
      }
      output += '\n';
    }
  }

  const shouldUseAI = useAI || config?.changelog?.useAI;
  if (shouldUseAI) {
    const aiSummary = await generateChangelogEntries(
      commits.map((c) => ({ message: c.raw })),
      config.tone,
      config.model,
      toolName
    );
    output = `### 🧠 Summary\n${aiSummary}\n\n` + output;
  }

  return output;
}

function getSectionTitle(type: string): string {
  switch (type) {
    case 'feat':
      return 'Features';
    case 'fix':
      return 'Bug Fixes';
    case 'docs':
      return 'Documentation';
    case 'chore':
      return 'Chores';
    case 'style':
      return 'Style Tweaks';
    case 'refactor':
      return 'Refactoring';
    case 'perf':
      return 'Performance';
    case 'test':
      return 'Tests';
    default:
      return type;
  }
}
