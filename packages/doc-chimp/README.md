# 📚 doc-chimp

> Documentation, automated. Less typing, more shipping.

[![npm version](https://img.shields.io/npm/v/doc-chimp)](https://www.npmjs.com/package/doc-chimp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![CI](https://img.shields.io/github/actions/workflow/status/Chimp-Stack/chimp-stack/release.yml?label=release)](https://github.com/Chimp-Stack/chimp-stack/actions/workflows/release.yml)

---

`doc-chimp` helps generate, manage, and eventually hallucinate beautiful documentation for your project—so you can spend less time updating README files and more time writing functions with obscure names like `frobnicate()`.

> ⚠️ This is an early-stage tool! Features are limited, monkeys are still learning.

---

## 🧠 Features

- 🔍 `doc-chimp overview` – Lists files and exports in your project for a bird’s-eye view
- ⚙️ `doc-chimp config` – Read and write `.chimprc` values with ease
- 📂 Supports per-package config in monorepos
- 🧪 No AI integration (yet) – but the monkeys are learning fast!

### Coming Soon

- 🧠 AI-generated inline docs (TypeScript docstrings on monkey steroids)
- 📚 Static HTML documentation built from your code and `.chimprc` config
- 📘 Smarter READMEs and usage examples with AI help
- 🔗 Cross-linked changelogs with 1 for rich release notes - *early support already available in `overview`*

---

## 📦 Installation

```bash
npm install -g doc-chimp
```

Or just use via `npx`:

```bash
npx doc-chimp overview
```

---

## 🧠 Initialize Your Config with `init`

You can quickly create or update your `.chimprc` file using the built-in init command:

```bash
npx doc-chimp init
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

`doc-chimp` supports configuration via the `docChimp` namespace in a `.chimprc` file at the root of your repo. This should be a plain JSON file (no .json extension).

### Example `.chimprc`

```json
{
  "docChimp": {
    "exclude": [
      "node_modules",
      "dist"
    ],
    "format": "markdown",
    "outputDir": "docs",
    "changelog": true
  }
}
```

---

## 🛠 Config Commands

You can use `doc-chimp config` to manage settings in your `.chimprc` without editing the file manually (though you still can if you like that sort of thing).

### `config list`

```bash
doc-chimp config list
```

Prints all current config values under the `docChimp` namespace.

### `config get <key>`

```bash
doc-chimp config get format
```

Gets the value of a specific config key.

### `config set <key> <value>`

```bash
doc-chimp config set output docs/
doc-chimp config set includePrivate true
```

Sets a config key. Supports string, boolean, number, and arrays (as comma-separated values).

---

## 📂 Overview Command

```bash
doc-chimp overview [options]
```

Lists:

* Files and subfolders in your project
* Uses `include` / `exclude` patterns from your .chimprc, unless overridden
* Optionally outputs a markdown (`.md`) or JSON file

### Options
| Flag                   | Description                                                                                  |
| ---------------------- | -------------------------------------------------------------------------------------------- |
| `--pretty`             | Prettify output with colors                                                                  |
| `--include <globs...>` | Override `include` patterns from `.chimprc`                                                  |
| `--output [path]`      | Write overview to file instead of console                                                    |
|                        | - If no path provided, writes `overview.md` inside the configured output directory (default) |
|                        | - If path is a directory (ends with `/`), writes `overview.md` inside that directory         |
|                        | - If path is a filename without extension, appends `.md` or `.json` depending on format      |
|                        | - If path is a filename with extension, uses it as-is                                        |
|                        | - If relative filename given, does NOT prepend output directory                              |
| `--undocumented`       | Only include files lacking top-level documentation                                           |
| `--show-changelog`     | Include the latest changelog entry for each file (requires changelog support in `.chimprc`)  |
                                       |


### Example
```bash
doc-chimp overview --pretty --include src/ packages/utils/ --output docs/
doc-chimp overview --output project-structure.md
doc-chimp overview --output ./custom-output.json --format json
doc-chimp overview --show-changelog --pretty
```

---

## 🐛 Contributing

Feature requests, bug reports, and “this sucks” feedback all welcome. Start an issue or throw a PR.

Want to add your own AI model or custom formatter? Stay tuned for plugin support.

---

## ⚖️ License

MIT. You break it, you bought it. Just kidding. But seriously, don’t blame the monkeys.

---

## 🐵 Parting Wisdom

> "Docs or it didn’t happen."
> — A very tired tech lead, probably
