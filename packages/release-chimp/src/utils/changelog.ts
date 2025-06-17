import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'child_process';

type Commit = {
  type: string;
  description: string;
  hash: string;
};

// Map commit types to changelog categories
const CATEGORY_MAP: Record<string, string> = {
  feat: 'Added',
  fix: 'Fixed',
  docs: 'Documentation',
  style: 'Style',
  refactor: 'Refactored',
  test: 'Tests',
  chore: 'Chores',
};

function parseCommitMessage(msg: string): Commit | null {
  // Expected format: "type(scope?): description"
  const match = msg.match(/^(\w+)(\(.+\))?:\s(.+)$/);
  if (!match) return null;
  return {
    type: match[1],
    description: match[3],
    hash: '',
  };
}

export function generateChangelog(version: string): string {
  // Get last git tag
  let lastTag = '';
  try {
    lastTag = execSync('git describe --tags --abbrev=0')
      .toString()
      .trim();
  } catch {
    lastTag = '';
  }

  // Get commits since last tag or all commits if no tag
  const revRange = lastTag ? `${lastTag}..HEAD` : 'HEAD';
  const rawCommits = execSync(
    `git log ${revRange} --pretty=format:%s%n%H%n---`
  ).toString();

  const commitLines = rawCommits.split('\n---\n').filter(Boolean);

  const commits: Commit[] = commitLines
    .map((block) => {
      const [msg, hash] = block.split('\n');
      const commit = parseCommitMessage(msg);
      if (!commit) return null;
      commit.hash = hash;
      return commit;
    })
    .filter((c): c is Commit => c !== null);

  if (commits.length === 0) {
    return `## [${version}] - ${new Date().toISOString().split('T')[0]}\n\n_No notable changes._\n`;
  }

  // Group by category
  const grouped: Record<string, Commit[]> = {};
  for (const commit of commits) {
    const category = CATEGORY_MAP[commit.type] || 'Others';
    if (!grouped[category]) grouped[category] = [];
    grouped[category].push(commit);
  }

  // Build changelog markdown
  let changelog = `## [${version}] - ${new Date().toISOString().split('T')[0]}\n`;

  for (const category of Object.keys(grouped)) {
    changelog += `\n### ${category}\n`;
    for (const commit of grouped[category]) {
      // Use first line + short commit hash
      changelog += `- ${commit.description} (${commit.hash.slice(0, 7)})\n`;
    }
  }

  changelog += '\n';

  return changelog;
}

const changelogPath = path.resolve(process.cwd(), 'CHANGELOG.md');

export function writeChangelog(version: string): void {
  let existingContent = '';

  if (fs.existsSync(changelogPath)) {
    existingContent = fs.readFileSync(changelogPath, 'utf-8');
  }

  // Generate new changelog section here
  const newSection = generateChangelog(version);

  // Ensure file has a header, add if missing
  if (!existingContent.startsWith('# Changelog')) {
    existingContent = '# Changelog\n\n' + existingContent;
  }

  // Remove header from existing content
  const contentWithoutHeader = existingContent.replace(
    /^# Changelog\s*\n*/,
    ''
  );

  // Prepend new section after header
  const updatedContent = `# Changelog\n\n${newSection}${contentWithoutHeader}`;

  fs.writeFileSync(changelogPath, updatedContent, 'utf-8');
}
