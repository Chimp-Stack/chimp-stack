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

* 🔍 `doc-chimp overview` – Lists files and exports in your project for a bird’s-eye view
* ⚙️ `doc-chimp config` – Read and write `.chimprc` values with ease
* 📂 Supports per-package config in monorepos
* 🧪 No AI integration (yet) – but we're working on it!

Coming soon:

* 🤖 AI-generated inline documentation for TypeScript
* 📝 AI-generated READMEs and usage examples
* 📖 HTML docs generation from code + config
* 🧠 Integration with `git-chimp` changelogs for smarter release notes

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

### Example `.chimprc`

```json
{
  "docChimp": {
    "format": "markdown",
    "output": "docs/",
    "includePrivate": false
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
doc-chimp overview
```

Lists:

* Files and subfolders in your `src/` directory
* Exported functions and types from each file
* Flags anything undocumented or mysterious

No GPT required—just cold, hard AST parsing.

---

## 🚧 Roadmap

Features on the way:

* 🧠 AI-generated inline docs based on your code (like docstrings on monkey steroids)
* 📚 Render static HTML documentation from `.chimprc` config
* 📘 Smarter README and usage examples using GPT
* 🔗 Cross-linking with changelogs from `git-chimp`

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
