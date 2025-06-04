module.exports = {
  branches: ['main'],
  plugins: [
    ['@semantic-release/commit-analyzer'],
    ['@semantic-release/release-notes-generator'],
    [
      '@semantic-release/npm',
      {
        // Only relevant for published packages — helps avoid workspace errors
        pkgRoot: '.',
      },
    ],
    [
      '@semantic-release/git',
      {
        assets: ['CHANGELOG.md', 'package.json'],
        message:
          'chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}',
      },
    ],
    '@semantic-release/github',
  ],
  tagFormat: '${pkg.name}@${version}',
  extends: 'semantic-release-monorepo',
  changelogFile: 'CHANGELOG.md',
};
