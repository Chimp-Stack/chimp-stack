#!/usr/bin/env node

import fs from 'fs';
import { execSync } from 'child_process';

const bumpType = process.argv[2]; // e.g., 'patch'
const shouldPush = process.argv.includes('--push');

if (!['patch', 'minor', 'major'].includes(bumpType)) {
  console.error(
    'Usage: node release-all.js patch|minor|major [--push]'
  );
  process.exit(1);
}

const releaseOrder = JSON.parse(
  fs.readFileSync('./scripts/release-order.json', 'utf-8')
);

for (const pkg of releaseOrder) {
  console.log(`\n🔧 Bumping ${pkg} (${bumpType})...`);
  execSync(
    `node ./scripts/bump.js ${pkg} ${bumpType}${shouldPush ? ' --push' : ''}`,
    {
      stdio: 'inherit',
    }
  );
}

console.log(
  '\n🎉 Done! Tags created for each package. Push manually if needed.'
);
