// scripts/sync-package-versions.js
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const packagesDir = path.resolve('packages');

const getLatestTag = (prefix) => {
  try {
    const tag = execSync(
      `git tag --list '${prefix}@*' --sort=-v:refname`
    )
      .toString()
      .split('\n')[0]
      .trim();
    return tag.split('@')[1]; // returns the version
  } catch (e) {
    console.error(`Failed to get tag for ${prefix}`);
    return null;
  }
};

const updatePackageVersion = (pkg, version) => {
  const pkgPath = path.join(packagesDir, pkg, 'package.json');
  const pkgJson = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  pkgJson.version = version;
  fs.writeFileSync(pkgPath, JSON.stringify(pkgJson, null, 2) + '\n');
  console.log(`✅ Updated ${pkg} to version ${version}`);
};

const packages = fs
  .readdirSync(packagesDir)
  .filter((dir) =>
    fs.existsSync(path.join(packagesDir, dir, 'package.json'))
  );

let changed = false;

for (const pkg of packages) {
  const version = getLatestTag(pkg);
  if (version) {
    updatePackageVersion(pkg, version);
    changed = true;
  }
}

if (changed) {
  execSync('git config user.name "chimp-bot"');
  execSync('git config user.email "chimp-bot@example.com"');
  execSync('git add packages/**/package.json');
  execSync(
    'git commit -m "chore: sync package.json versions with latest tags [skip ci]"'
  );
  execSync('git push');
  console.log('🚀 Pushed synced versions');
} else {
  console.log('🦥 No versions to sync');
}
