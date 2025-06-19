import { simpleGit } from 'simple-git';
import fs from 'fs';
import type { DefaultLogFields, ListLogLine } from 'simple-git';
import { generateChangelogEntries } from '@chimp-stack/core/utils/openai';
import {
  GitChimpConfig,
  loadChimpConfig,
  logError,
  logSuccess,
  logWarn,
} from '@chimp-stack/core';

export async function handleChangelog(
  options: {
    from?: string;
    to?: string;
    output?: string;
    ai?: boolean;
  } = {}
) {
  const config = loadChimpConfig('gitChimp') as GitChimpConfig;
  const git = simpleGit();

  const from = options.from || (await git.tags()).latest;
  const to = options.to || 'HEAD';

  if (!from) {
    logError(
      '❌ No tags found to use as a starting point. Use --from manually.'
    );
    process.exit(1);
  }

  const log = await git.log({ from, to });
  const commits: (DefaultLogFields & ListLogLine)[] = [...log.all];

  if (commits.length === 0) {
    logWarn('⚠️ No commits found between specified tags.');
    process.exit(0);
  }

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
      output += `### ${type}\n`;
      for (const desc of semanticGroups[type]) {
        output += `- ${desc}\n`;
      }
      output += '\n';
    }
  }

  if (options.ai || config?.changelog?.useAI) {
    const aiSummary = await generateChangelogEntries(
      commits,
      config.tone,
      config.model
    );
    output = `### 🧠 Summary\n${aiSummary}\n\n` + output;
  }

  if (options.output) {
    fs.appendFileSync(options.output, output);
    logSuccess(`✅ Changelog written to ${options.output}`);
  } else {
    console.log(output);
  }

  process.exit(0);
}
