#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

// 🐒 CLI args
const [pkgName, bumpType] = process.argv.slice(2);

if (!pkgName || !['major', 'minor', 'patch'].includes(bumpType)) {
  console.error(
    'Usage: node ./scripts/bump.js <package-name> major|minor|patch'
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
if (bumpType === 'major') semver[0]++;
if (bumpType === 'minor') semver[1]++;
if (bumpType === 'patch') semver[2]++;
if (bumpType !== 'major') semver[0] = semver[0]; // stay the same
if (bumpType !== 'minor') semver[1] = semver[1]; // stay the same
if (bumpType !== 'patch') semver[2] = 0; // reset lower digits

const newVersion = semver.join('.');
pkg.version = newVersion;

// Write updated version
fs.writeFileSync(pkgJsonPath, JSON.stringify(pkg, null, 2) + '\n');
console.log(
  `📦 ${pkg.name} bumped: ${currentVersion} → ${newVersion}`
);

// Commit and tag
execSync(`git add ${pkgJsonPath}`);
execSync(`git commit -m "chore(${pkgName}): bump to ${newVersion}"`);
execSync(`git tag "${pkg.name}@${newVersion}"`);
execSync(`git push --follow-tags`);

console.log(
  `✅ Done: committed and tagged ${pkg.name}@${newVersion}`
);
