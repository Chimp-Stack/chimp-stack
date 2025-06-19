import { simpleGit } from 'simple-git';
import type { DefaultLogFields, ListLogLine } from 'simple-git';
import type {
  GitChimpConfig,
  ReleaseChimpConfig,
} from '../../types/config.js';
import { generateChangelogEntries } from '../openai.js';
import { loadChimpConfig } from '../../config.js';

type ChangelogConfig = GitChimpConfig | ReleaseChimpConfig;

export async function generateSemanticChangelog({
  from,
  to,
  toolName,
  useAI = false,
}: {
  from: string;
  to: string;
  toolName: 'gitChimp' | 'releaseChimp';
  useAI?: boolean;
}): Promise<string> {
  const config = (await loadChimpConfig(toolName)) as ChangelogConfig;

  const git = simpleGit();
  const log = await git.log({ from, to });
  const commits: (DefaultLogFields & ListLogLine)[] = [...log.all];

  const semanticGroups: Record<string, string[]> = {};

  for (const c of commits) {
    const match = c.message.match(
      /^(feat|fix|docs|chore|style|refactor|perf|test)(\(.*?\))?: (.+)/
    );
    if (match) {
      const type = match[1];
      const description = match[3];
      if (!semanticGroups[type]) semanticGroups[type] = [];
      semanticGroups[type].push(description);
    }
  }

  let output = `## Changelog (${from} → ${to})\n\n`;

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

  if (useAI || config?.changelog?.useAI) {
    const aiSummary = await generateChangelogEntries(
      commits,
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
