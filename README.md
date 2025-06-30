# 🐒 chimp-stack

> Monorepo of intelligent (and slightly unhinged) dev tools powered by AI, sarcasm, and bananas.

Welcome to the **chimp-stack**, the monorepo that houses the growing family of tools designed to make your development workflow smoother, sassier, and suspiciously simian.

This monorepo is built using **Turborepo** and managed via **npm** workspaces. Each tool can be developed, built, and released independently—but shares common logic via `@chimp-stack/core`.

---

## 📁 Packages

| Package        | Description                                      |
| -------------- | ------------------------------------------------ |
| `core`   | Shared config/env loader used by all tools       |
| `git-chimp`    | Commit message + PR body generator               |
| `doc-chimp`    | Auto-generates documentation from code & commits |
| `review-chimp` | (Coming soon) AI-assisted code review comments   |

### Package Releases
- [`git-chimp`](https://github.com/Chimp-Stack/chimp-stack/releases?q=git-chimp)
- [`doc-chimp`](https://github.com/Chimp-Stack/chimp-stack/releases?q=doc-chimp)
- [`core`](https://github.com/Chimp-Stack/chimp-stack/releases?q=core)

---

## 🚀 Getting Started

```bash
# Clone the repo
git clone https://github.com/Chimp-Stack/chimp-stack.git
cd chimp-stack

# Install dependencies
npm install

# Build all packages
npm run build

# Run dev mode for a package
npm run dev --workspace=git-chimp
```

---

## 🧠 Toolchain

* **Language**: TypeScript
* **Bundler**: [`tsup`](https://github.com/egoist/tsup)
* **Monorepo**: [`Turborepo`](https://turbo.build/repo)
* **Package Manager**: npm (via workspaces)
* **Release Pipeline**: [`semantic-release`](https://github.com/semantic-release/semantic-release) + GitHub Actions

---

## 🧪 Local Development

Each package has its own `src/`, `package.json`, and scripts.

```bash
# Build a specific package
npm run build --workspace=doc-chimp

# Lint everything
npm run lint
```

You can add a `.env` file at the project root or inside each package if needed. But environment variables like `OPENAI_API_KEY` can also be set globally.

---

## 📦 Publishing to npm

Each package is released independently using `semantic-release` via GitHub Actions.

### What You Need

* `GH_RELEASE_TOKEN` (GitHub token with repo access)
* `NPM_TOKEN` (npm token with publish access)

### Release Workflow

Push to `main` in any package → trigger release job → `semantic-release` checks commits → version bump → publish to npm.

See individual package `.releaserc` files for configuration.

---

## 📄 Monorepo Structure

```sh
chimp-stack/
├── packages/
│   ├── core/       # shared logic
│   ├── git-chimp/        # git commit / PR helper
│   ├── doc-chimp/        # doc generator
│   └── review-chimp/     # (planned)
├── .env                  # optional global env
├── turbo.json            # pipeline definitions
├── package.json          # npm workspaces
└── README.md             # this file
```

---

## 🐵 The Vision

Build AI-assisted tools for devs that:

* Respect your time
* Speak your language (dry, slightly burned-out sarcasm)
* Integrate easily into your git workflow

All powered by OpenAI, TypeScript, and pure unfiltered caffeine.

> *“Even the best engineers deserve a monkey on their shoulder.”*

---

## 📬 Contributing

Pull requests are welcome. Bananas optional.

1. Fork the repo
2. Create your branch: `git checkout -b monkey-magic`
3. Commit with care: `npx git-chimp` (of course)
4. Open a PR

---

## 📚 Related Tools

* [`semantic-release`](https://semantic-release.gitbook.io/) – automatic versioning and changelog generation
* [`tsup`](https://tsup.egoist.dev/) – zero-config TypeScript bundler
* [`dotenv`](https://github.com/motdotla/dotenv) – environment variable loading
* [`zod`](https://github.com/colinhacks/zod) – schema validation

---

## 🧵 Maintainers

* Mark Rabey – [@MarkRabey](https://github.com/MarkRabey)

---

## 🧸 License

MIT – Because sharing is caring (and monkeys don't understand NDAs).

---

*This stack is bananas. B-A-N-A-N-A-S.* 🍌
