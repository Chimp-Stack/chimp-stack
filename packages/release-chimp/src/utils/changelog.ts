import fs from 'fs';
import path from 'path';

export function updateChangelog(newVersion: string) {
  const changelogPath = path.resolve(process.cwd(), 'CHANGELOG.md');
  const date = new Date().toISOString().split('T')[0];

  const newEntry = `\n## [${newVersion}] - ${date}\n\n- Placeholder for actual changes. Go bananas.\n`;

  if (!fs.existsSync(changelogPath)) {
    const initial = `# Changelog\n${newEntry}`;
    fs.writeFileSync(changelogPath, initial);
    console.log('📝 Created new CHANGELOG.md');
  } else {
    const existing = fs.readFileSync(changelogPath, 'utf8');
    const updated = existing + newEntry;
    fs.writeFileSync(changelogPath, updated);
    console.log('📝 Updated CHANGELOG.md');
  }
}
