#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

// 🐒 CLI args
const args = process.argv.slice(2);
const [pkgName, bumpType] = args.filter(
  (arg) => !arg.startsWith('--')
);
const shouldPush = args.includes('--push');

if (!pkgName || !['major', 'minor', 'patch'].includes(bumpType)) {
  console.error(
    'Usage: node ./scripts/bump.js <package-name> major|minor|patch [--push]'
  );
  process.exit(1);
}

const packageDir = path.resolve('packages', pkgName);
const pkgJsonPath = path.join(packageDir, 'package.json');

if (!fs.existsSync(pkgJsonPath)) {
  console.error(`❌ Package ${pkgName} not found at ${pkgJsonPath}`);
  process.exit(1);
}

// Read current package.json
const pkg = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'));
const currentVersion = pkg.version;

// Bump version
const semver = currentVersion.split('.').map(Number);
if (bumpType === 'major') {
  semver[0]++;
  semver[1] = 0;
  semver[2] = 0;
}
if (bumpType === 'minor') {
  semver[1]++;
  semver[2] = 0;
}
if (bumpType === 'patch') {
  semver[2]++;
}

const newVersion = semver.join('.');
pkg.version = newVersion;

// Write updated version
fs.writeFileSync(pkgJsonPath, JSON.stringify(pkg, null, 2) + '\n');
console.log(
  `📦 ${pkg.name} bumped: ${currentVersion} → ${newVersion}`
);

// Git stuff
execSync(`git add ${pkgJsonPath}`);
execSync(`git commit -m "chore(${pkgName}): bump to ${newVersion}"`);
execSync(`git tag "${pkg.name}@${newVersion}"`);

if (shouldPush) {
  execSync(`git push && git push --tags`);
  console.log(
    `🚀 Pushed commit and tag for ${pkg.name}@${newVersion}`
  );
} else {
  console.log(`🛑 Skipped git push — run it manually when ready.`);
}
