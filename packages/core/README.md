# 🧠 @chimp-stack/core

> Shared configuration and environment loader for the growing chimp toolchain.

[![npm version](https://img.shields.io/npm/v/@chimp-stack/core)](https://www.npmjs.com/package/@chimp-stack/core)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![CI](https://img.shields.io/github/actions/workflow/status/Chimp-Stack/chimp-stack/release.yml?label=release)](https://github.com/Chimp-Stack/chimp-stack/actions/workflows/release.yml)



This package contains the core logic for reading `.chimprc` config files, loading environment variables, and handling shared behavior between tools like `git-chimp`, `doc-chimp`, and `review-chimp`.

## 📦 Installation

Install via npm:

```bash
npm install @chimp-stack/core
```

Or in a monorepo:

```bash
npm install --workspace=@chimp-stack/core
```

---

## 🛠 Usage

In your tool package (e.g., `git-chimp`, `review-chimp`), import and use the helpers:

```ts
import { loadChimpConfig, getEnv } from '@chimp-stack/core';

const config = loadChimpConfig('gitChimp');
const env = getEnv();
```

---

## 📁 Config File: `.chimprc`

This package looks for a `.chimprc` file in the current project or in your home directory (`~/.chimprc`).

```json
{
  "gitChimp": {
    "model": "gpt-4",
    "tone": "dry sarcasm",
    "prMode": "draft"
  },
  "reviewChimp": {
    "severity": "high"
  }
}
```

The structure is namespaced per tool. You can override values via CLI flags if needed.

---

## 🏗 Exported Functions

| Function                   | Description                                                                   |
| -------------------------- | ----------------------------------------------------------------------------- |
| `loadChimpConfig(scope)`   | Loads config for the given tool (`gitChimp`, `docChimp`, etc) from `.chimprc` |
| `getEnv()`                 | Validates and returns required environment variables (e.g., `OPENAI_API_KEY`) |
| `resolveChimpConfigPath()` | Returns the resolved file path of the active `.chimprc`                       |

---

## 🧪 Development

### Build

```bash
npm run build
```

This uses `tsup` to emit both ESM and CJS output to `dist/`.

### Lint

```bash
npm run lint
```

---

## 🚀 Publishing

This package can be independently published from the monorepo (if applicable) using `npm publish` or through CI pipelines like `semantic-release`.

If used inside a Turborepo or other monorepo setup, make sure its `package.json` has a `name` field and correct `main`/`exports` paths for npm publishing.

---

## 🐒 Part of the Chimp Stack™

* [`git-chimp`](https://www.npmjs.com/package/@chimp-stack/git-chimp) – commit & PR generator  
  [source](https://github.com/Chimp-Stack/chimp-stack/tree/main/packages/git-chimp)
* [`doc-chimp`](https://www.npmjs.com/package/@chimp-stack/doc-chimp) – auto-documentation from commits and code
  [source](https://github.com/Chimp-Stack/chimp-stack/tree/main/packages/doc-chimp)
* `review-chimp` – coming soon: let the monkey do your code reviews
* `core` – this package  
  [source](https://github.com/Chimp-Stack/chimp-stack/tree/main/packages/core)

> *“Because even the best engineers deserve a monkey on their shoulder.”*