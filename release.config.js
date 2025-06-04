module.exports = {
  branches: ['main'],
  tagFormat: '${npm_package_name}@${version}',
  extends: 'semantic-release-monorepo',
  plugins: [
    ['@semantic-release/commit-analyzer'],
    ['@semantic-release/release-notes-generator'],
    '@semantic-release/npm',
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
  changelogFile: 'CHANGELOG.md',
};
