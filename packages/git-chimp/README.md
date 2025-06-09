# 🐒 git-chimp

> Because writing commit messages and pull requests sucks. Let the AI do it.

[![npm version](https://img.shields.io/npm/v/git-chimp)](https://www.npmjs.com/package/git-chimp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![CI](https://img.shields.io/github/actions/workflow/status/Chimp-Stack/chimp-stack/release.yml?label=release)](https://github.com/Chimp-Stack/chimp-stack/actions/workflows/release.yml)

---

`git-chimp` automates your Git commits and pull requests using AI. It analyzes your staged changes or commit history, then generates surprisingly coherent commit messages and PRs—so you can stop typing “fix stuff” for the fifth time today.

> ⚠️ This is an early-stage tool! Features are limited, monkeys are still learning.

---

## 🧠 Features

* 🧵 `git-chimp commit` – GPT-powered commit message generation from staged changes
* 🚀 `git-chimp pr` – GPT-generated pull request descriptions from commit diffs
* 📝 `git-chimp changelog` – Auto-generate changelogs, with optional AI summaries
* ⚙️ `git-chimp config` – Manage `.chimprc` settings without editing the file
* 🧪 Supports both local and global `.chimprc` configs
* 🐙 Integrates with GitHub for PR management

Coming soon:

* 🔀 Branch naming assistant (`git-chimp name` or `git-chimp branch`)
* 🧪 Dry run support (`--dry-run`)
* 🍿 Emoji support and improved Conventional Commit modes

---

## 📦 Installation

```bash
npm install -g git-chimp
```

Or use it via npx:

```bash
npx git-chimp commit
```

---

## 🧠 Initialize Your Config with `init`

You can quickly create or update your `.chimprc` file using the built-in init command:

```bash
npx git-chimp init
```

You'll be prompted to choose:

- Local or Global config location
- Local: stored in `./.chimprc`
- Global: stored in `~/.chimprc`

Then you'll be walked through a few simple questions to generate the correct config for your project or environment. If a config already exists, it will be merged with your new choices — no overwrites or data loss.

Some fields (like `openaiApiKey`) are only written to global config for security and reusability.

### Get your API keys:

- 🧠 OpenAI: https://platform.openai.com/account/api-keys
- 🐙 GitHub Token: https://github.com/settings/tokens _(Requires repo scope)_

---

## 🛠 Configuration

> [!WARNING]  
> The `.git-chimprc` file has been replaced with `.chimprc`. It will, however, continue to work - for now.

`git-chimp` supports configuration via the `gitChimp` namespace in a `.chimprc` file at the root of your repo. This should be a plain JSON file (no .json extension).

### Example `.chimprc`:

```json
{
  "gitChimp": {
    "model": "gpt-3.5-turbo",
    "tone": "sarcastic",
    "prMode": "draft",
    "enforceSemanticPrTitles": true,
    "enforceConventionalCommits": true,
    "changelog": {
      "aiSummary": true,
      "output": "CHANGELOG.md",
      "from": "v1.0.0",
      "to": "HEAD"
    }
  }
}
```

### Config Options

| Key                          | Type      | Description                                                                          |
| ---------------------------- | --------- | ------------------------------------------------------------------------------------ |
| `tone`                       | `string`  | Sets the writing style (e.g., `"corporate-safe"`, `"dry sarcasm"`, `"chaotic evil"`) |
| `model`                      | `string`  | OpenAI model to use (`gpt-3.5-turbo`, `gpt-4`, `gpt-4o`, `gpt-4o-mini`)              |
| `enforceConventionalCommits` | `boolean` | If `true`, enforces Conventional Commit style                                        |
| `enforceSemanticPrTitles`    | `boolean` | If `true`, enforces semantic PR titles (e.g., `feat:` prefix)                        |
| `prMode`                     | `string`  | PR mode: `open` (default), `draft`, `display`                                        |
| `changelog`                  | `object`  | Changelog generation options (see below)                                             |

`changelog` options:
| Key         | Type      | Description                                                             |
| ----------- | --------- | ----------------------------------------------------------------------- |
| `aiSummary` | `boolean` | If `true`, generates an AI summary section for the changelog            |
| `output`    | `string`  | File path to write or append changelog content (e.g., `"CHANGELOG.md"`) |
| `from`      | `string`  | Git tag or commit to start from (e.g., `"v1.0.0"`)                      |
| `to`        | `string`  | Git ref to end at (defaults to `HEAD` if omitted)                       |

---

## 🛠 Config Commands

You can use `git-chimp config` to manage settings in your `.chimprc` without editing the file manually (though you still can if you like that sort of thing).

### `config list`

```bash
git-chimp config list
```
Prints all current config values under the `gitChimp` namespace.

### `config get <key>`

```bash
git-chimp config get model
```
Gets the value of a specific config key.

### config set <key> <value>

```bash
git-chimp config set tone "corporate-safe"
git-chimp config set enforceSemanticPrTitles true
```
Sets a config key. Supports string, boolean, number, and arrays (as comma-separated values).

---

## 🧪 CLI Commands

### `commit`

```bash
git add .
git-chimp commit
```
Generates a commit message based on your staged changes.

#### Options
| Flag               | Description                                                            |
| ------------------ | ---------------------------------------------------------------------- |
| `--tone <style>`   | Writing style for commit message                                       |
| `--model <model>`  | OpenAI model to use                                                    |
| `--enforce-cc`     | Enforce Conventional Commit style                                      |
| `--scope <scope>`  | Optional scope to include in commit message (e.g. `feat(scope): ...`)  |
| `-c`, `--custom`   | Manually type your commit message (you beautiful control freak)        |
| `-m`, `--message`  | Print GPT commit message to stdout and exit (good for CI, scripting)   |


---

### `pr`

```bash
git-chimp pr
```
Generates a PR description and opens one on GitHub.

#### Options
| Flag               | Description                                                        |
| ------------------ | ------------------------------------------------------------------ |
| `--tone <style>`   | Writing style for PR                                               |
| `--model <model>`  | OpenAI model to use                                                |
| `--pr-mode <mode>` | PR mode: `open`, `draft`, `display`                                |
| `--semantic-title` | Enforce semantic PR title style                                    |
| `-u`, `--update`   | Update an existing PR instead of creating a new one (if it exists) |

---

### `changelog`

```bash
git-chimp changelog
```
Generates a changelog from commit history.

#### Options
| Flag              | Description                                              |
| ----------------- | -------------------------------------------------------- |
| `--from <tag>`    | Git tag or commit to start from (defaults to latest tag) |
| `--to <ref>`      | Git ref to end at (defaults to `HEAD`)                   |
| `--output <file>` | File path to write the changelog to                      |
| `--ai`            | Use OpenAI to generate a summary section                 |

---

## 💡 Pro Tip

The config system is merge-friendly. It works like this (highest priority wins):

1. Command-line flags (e.g., `--tone`)
2. `.chimprc` config
3. Defaults baked into the tool

So yeah — you can go full control freak without ever touching a config file, or commit to the chimp with a persistent setup.

---

## 🧨 Can I override git commit?

**Yes... but with caution.** You *can* alias `git commit` to use `git-chimp`, but this disables standard Git commit behavior.

Here’s an alias override (not recommended unless you're into danger):

```bash
git config --global alias.commit '!git-chimp commit'
```

For a safer setup, try:

```bash
git config --global alias.chimp-commit '!git-chimp commit'
git config --global alias.chimp-pr '!git-chimp pr'
```

Then use:
```bash
git chimp-commit
git chimp-pr
```

Or if you're lazy and proud:

```bash
alias gc='git-chimp commit'
alias gp='git-chimp pr'
```

---

## 🚧 Roadmap

Features on the way:

- 🔀 Branch naming assistant (git-chimp name or git-chimp branch)
- 🧪 Dry run support (--dry-run)
- 🍿 Emoji support and improved Conventional Commit modes
- 🤖 Smarter PR and commit message generation with AI tuning
- ⚙️ Plugin system for custom formatters and AI prompts

---

## 🐛 Contributing

Feature requests, bug reports, and “this sucks” feedback all welcome. Start an issue or throw a PR.

Want to add your own AI model or custom formatter? Stay tuned for plugin support.

---

## ⚖️ License

MIT. You break it, you bought it. Just kidding. But seriously, don’t blame the monkeys.

---

## 🐵 Parting Wisdom

> "Let the monkey write the messages. You’ve got bigger bugs to squash."
>
> — Ancient Git Proverb