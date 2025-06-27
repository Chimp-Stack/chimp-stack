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
    console.error(`❌ Failed to get tag for ${prefix}`);
    return null;
  }
};

const updatePackageVersion = (pkg, version) => {
  const pkgPath = path.join(packagesDir, pkg, 'package.json');
  const pkgJson = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  if (pkgJson.version !== version) {
    pkgJson.version = version;
    fs.writeFileSync(
      pkgPath,
      JSON.stringify(pkgJson, null, 2) + '\n'
    );
    console.log(`✅ Updated ${pkg} to version ${version}`);
  }
};

const packages = fs
  .readdirSync(packagesDir)
  .filter((dir) =>
    fs.existsSync(path.join(packagesDir, dir, 'package.json'))
  );

let updatedPackages = [];

// Update versions
for (const pkg of packages) {
  const version = getLatestTag(pkg);
  if (version) {
    updatePackageVersion(pkg, version);
    updatedPackages.push({ pkg, version });
  }
}

try {
  const status = execSync('git status --porcelain').toString().trim();

  if (status) {
    execSync('git config user.name "chimp-bot"');
    execSync('git config user.email "chimp-bot@chimp-stack.com"');
    execSync('git add packages/**/package.json');
    const versions = updatedPackages
      .map((p) => `${p.pkg}@${p.version}`)
      .join(', ');
    const commitMessage = `chore(release): 🚀 sync versions – ${versions} [skip ci]`;

    execSync(`git commit -m "${commitMessage}"`);
    execSync('git push');
    console.log('🚀 Pushed synced versions');
  } else {
    console.log(
      '🤫 Nothing to commit — working tree clean. All synced.'
    );
  }
} catch (err) {
  console.error(
    '🧨 Version sync failed, but silence is golden in CI:',
    err.message
  );
  process.exit(0); // Don't break the build if nothing needs syncing
}
