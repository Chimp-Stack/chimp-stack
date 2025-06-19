# 🦧 release-chimp

> Automate your package releases with AI-powered version bumping and changelog generation.

[![npm version](https://img.shields.io/npm/v/@chimp-stack/release-chimp)](https://www.npmjs.com/package/@chimp-stack/release-chimp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![CI](https://img.shields.io/github/actions/workflow/status/Chimp-Stack/chimp-stack/release.yml?label=release)](https://github.com/Chimp-Stack/chimp-stack/actions/workflows/release.yml)

---

`release-chimp` helps you bump versions and generate changelogs, all AI-assisted and fully configurable.

---

## 🧠 Features

* 🍌 `release-chimp bump` – Bump semantic version (`major`, `minor`, `patch`) with AI-assisted changelog
* 📝 `release-chimp changelog` – Generate changelogs from commit history, with optional AI summaries
* ⚙️ `release-chimp config` – Manage `.chimprc` settings without manual file edits
* 🚀 Integrates smoothly with git tagging and pushing releases
* 🤝 Part of the [Chimp Stack](https://github.com/Chimp-Stack/chimp-stack)

---

## 📦 Installation

```bash
npm install -g @chimp-stack/release-chimp
```
Or run without installing:

```bash
npx @chimp-stack/release-chimp bump minor --dry-run
```
---

## 🧠 Initialize Your Config with `init`

Create or update your .chimprc config for release-chimp:

```bash
npx @chimp-stack/release-chimp init
```

Choose local or global config location and answer simple prompts. Existing configs merge automatically.

---

## 🛠 Configuration

`release-chimp` uses the `releaseChimp` namespace inside `.chimprc` (JSON file at repo root).

### Example .chimprc:
```json
{
  "releaseChimp": {
    "bumpType": "patch",
    "tagFormat": "@chimp-stack/core@${version}",
    "changelog": {
      "path": "CHANGELOG.md",
      "useAI": true,
      "groupOrder": ["Added", "Fixed", "Changed"]
    },
    "dryRun": false,
    "noPackageJson": false,
    "noChangelog": false,
    "noGit": false
  }
}
```

### Config Options
| Key             | Type      | Description                                                  |
| --------------- | --------- | ------------------------------------------------------------ |
| `bumpType`      | `string`  | Default version bump (`major`, `minor`, or `patch`)          |
| `tagFormat`     | `string`  | Format for git tags (e.g., `"@chimp-stack/core@${version}"`) |
| `changelog`     | `object`  | Changelog generation options                                 |
| `dryRun`        | `boolean` | If true, simulate actions without writing or pushing         |
| `noPackageJson` | `boolean` | Skip updating `package.json` version                         |
| `noChangelog`   | `boolean` | Skip changelog generation                                    |
| `noGit`         | `boolean` | Skip git commit, tagging, and push                           |

`changelog` options:
| Key          | Type       | Description                                                |
| ------------ | ---------- | ---------------------------------------------------------- |
| `path`       | `string`   | File path for changelog output (default: `"CHANGELOG.md"`) |
| `useAI`      | `boolean`  | Use OpenAI to generate summary section                     |
| `groupOrder` | `string[]` | Order of commit groups in changelog                        |
---

## 🛠 Config Commands

You can use `release-chimp config` to manage settings in your `.chimprc` without editing the file manually (though you still can if you like that sort of thing).

### `config list`

```bash
release-chimp config list
```
Prints all current config values under the `gitChimp` namespace.

### `config get <key>`

```bash
release-chimp config get model
```
Gets the value of a specific config key.

### `config set <key> <value>`

```bash
release-chimp config set dryRun true
release-chimp config set tagFormat "@my-org/pkg@${version}"
```
Sets a config key. Supports string, boolean, number, and arrays (as comma-separated values).

---

## 🧪 CLI Commands
### `bump`

Bump the version and generate changelog:
```bash
release-chimp bump [major|minor|patch] [options]
```

Options
| Flag                | Description                                 |
| ------------------- | ------------------------------------------- |
| `--dry-run`         | Show what would happen, don’t write or push |
| `--no-package-json` | Skip package.json version update            |
| `--no-changelog`    | Skip changelog generation                   |
| `--no-git`          | Skip git commit, tag, and push              |

---

### `changelog`

```bash
release-chimp changelog
```

Generate a changelog from git commits.

Options

| Flag              | Description                               |
| ----------------- | ----------------------------------------- |
| `--from <tag>`    | Start tag or commit (default: latest tag) |
| `--to <ref>`      | End ref (default: `HEAD`)                 |
| `--output <file>` | File path to write changelog              |
| `--ai`            | Use AI to generate a summary section      |

---

### `init` and `config`

`release-chimp` shares init and config commands with the Chimp Stack core tools, to easily manage your `.chimprc` config.

---

## 💡 Pro Tip

Config precedence (highest wins):
1. CLI flags
2. `.chimprc` config
3. Defaults baked into the tool

---

## 🐒 Part of the Chimp Stack
`release-chimp` is part of the [Chimp Stack](https://github.com/Chimp-Stack/chimp-stack) - a growing suite of tools designed to monkey-proof your developer workflow, automating the boring parts so you can focus on shipping real crap.

Check out our other tools:
- `git-chimp` - AI-driven commit and PR automation
- `commit-chimp` - Streamlined commit and PR creation CLI
- `doc-chimp` - Automatic documentation generation

---

## 🐛 Contributing
Bugs, ideas, or monkey business? Open an issue or PR on [GitHub](https://github.com/Chimp-Stack/chimp-stack).

---

## ⚖️ License
MIT. No monkeys were harmed in the making of this software. We assume.

---

## 🐵 Parting Wisdom

>"Automate the tedious. Ship the awesome. Let the chimps do the rest."
>
> — The Internet (probably)