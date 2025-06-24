import path from 'node:path';
import { simpleGit } from 'simple-git';

type SemanticCommit = {
  type: string;
  scope?: string;
  description: string;
  isBreaking: boolean;
  raw: string;
};

export async function getSemanticCommits({
  from,
  to = 'HEAD',
  scoped = false,
  configDir = process.cwd(),
}: {
  from?: string;
  to?: string;
  scoped?: boolean;
  configDir?: string;
}): Promise<SemanticCommit[]> {
  const git = simpleGit();

  const topLevel = await git.revparse(['--show-toplevel']);
  const relativePath = path.relative(topLevel, configDir);
  const isRoot = relativePath === '' || relativePath === '.';

  const args = from
    ? ['log', `${from}...${to}`, '--pretty=%s']
    : ['log', '--pretty=%s'];
  if (scoped && !isRoot) {
    args.push('--', relativePath);
  }

  let rawLog: string;
  try {
    rawLog = await git.raw(args);
  } catch (err) {
    throw new Error(`❌ Failed to get git log: ${err}`);
  }

  const lines = rawLog
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  const semanticCommits: SemanticCommit[] = [];

  for (const msg of lines) {
    const parsed = parseCommitMessage(msg);

    if (!parsed) continue;
    if (!parsed.type || !parsed.description) continue;

    semanticCommits.push({
      type: parsed.type,
      scope: parsed.scope || undefined,
      description: parsed.description,
      isBreaking: parsed.isBreaking,
      raw: msg,
    });
  }

  return semanticCommits;
}

export function parseCommitMessage(
  message: string
): SemanticCommit | null {
  const [headerLine, ...bodyLines] = message.split('\n');

  const match = headerLine.match(
    /^(?<type>feat|fix|docs|chore|style|refactor|perf|test)(?<breaking>!)?(?:\((?<scope>[^)]+)\))?: (?<description>.+)$/
  );

  if (!match?.groups) return null;

  const { type, scope, description, breaking } = match.groups;

  const body = bodyLines.join('\n');
  const isBreaking = !!breaking || /BREAKING CHANGE:/i.test(body);

  return {
    type,
    scope,
    description,
    isBreaking,
    raw: message,
  };
}
