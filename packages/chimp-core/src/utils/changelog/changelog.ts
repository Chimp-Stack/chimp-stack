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
  const git = simpleGit();

  // 🕵️ Verify 'from' actually exists as a valid git ref
  if (from) {
    const refExists = await git
      .raw(['rev-parse', '--verify', `${from}^{}`])
      .then(() => true)
      .catch(() => false);

    if (!refExists) {
      console.warn(
        `⚠️  Git ref '${from}' not found — falling back to full history.`
      );
      from = undefined;
    }
  }

  // 📜 Get git log
  let log;
  try {
    log = from ? await git.log({ from, to }) : await git.log();
  } catch (err) {
    throw new Error(`❌ Failed to get git log: ${err}`);
  }

  const commits: (DefaultLogFields & ListLogLine)[] = [...log.all];

  if (commits.length === 0) {
    return `## Changelog (${from ?? 'initial'} → ${to})\n\n_No commits found._\n`;
  }

  // 🧠 Group by type
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

  console.log({ commits, groupOrder });

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
