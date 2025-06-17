import fs from 'node:fs';
import path from 'node:path';

export function generateChangelog(version: string): string {
  const date = new Date().toISOString().split('T')[0];
  return `\n## [${version}] - ${date}\n\n- Placeholder for actual changes. Go bananas.\n`;
}

export function writeChangelog(version: string) {
  const changelogPath = path.resolve(process.cwd(), 'CHANGELOG.md');
  const newEntry = generateChangelog(version);

  if (!fs.existsSync(changelogPath)) {
    fs.writeFileSync(changelogPath, `# Changelog\n${newEntry}`);
    console.log('📝 Created new CHANGELOG.md');
  } else {
    fs.appendFileSync(changelogPath, newEntry);
    console.log('📝 Updated CHANGELOG.md');
  }
}
