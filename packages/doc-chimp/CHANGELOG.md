# Changelog
## Changelog (@chimp-stack/doc-chimp@0.1.0 → HEAD)

### Features
- add ability to change working directory before running command
- add @chimp-stack/release-chimp as a dev dependency
- add auto-detected bump type based on commit history (#7)
- add --latest option to generate changelog between last two tags
- add support for specifying output format
- add CI mode option for skipping changelog, git, and package.json
- add new functionality for writing changelog to file
- refactor import paths for 'generateChangelogEntries' to use '@chimp-stack/core/utils/openai'
- add OpenAI and changelog utils
- add options to init
- add options to skip updating package.json, changelog, or git commands
- add bump command to release-chimp

### Bug Fixes
- Update path in release workflow script
- improve loading of Chimp configuration
- update version detection support for tagFormat
- fix useAI flag in handleBump function
- update version detection for changelogs
- Add prefix parameter to log functions
- replace logger and getChalk removed by mistake

### Refactoring
- update changelog generation and writing process

### Documentation
- Include usage examples in README
- update README

### Tests
- create vitest configuration file
- Update writeChangelog test to properly read existing changelog content

### Chores
- correctling github action releases
- update release process to use correct path for bump command
- Update build script to include all packages
- regenerate lockfile after workspace changes
- correctling github action releases
- add @chimp-stack/release-chimp to devDependencies in package.json
- update release-chimp command in workflow
- run release-chimp bump --ci in package directories
- Update changelog handling logic
- refactor code in handleBump function
- add release-chimp to release action matrix
- refactor tagFormatToRegex to handle dynamic tag formats
- update build config
- update packages to their latest versions
- refactor git-chimp to use core changelog command
- Refactor chimp-core package structure
- refactor init to use @inquirer/prompts
- 0.1.1
- 0.1.0
- add changelog, git, and version tests
- update generateChangelog function
- update dependencies
- initial release-chimp scaffolding
