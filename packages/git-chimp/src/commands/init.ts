import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { fileURLToPath } from 'url';
import os from 'os';
import chalk from 'chalk';
import { simpleGit } from 'simple-git';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function ask(question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, (answer) => resolve(answer.trim()));
  });
}

async function getRepoFromGit(): Promise<string | null> {
  try {
    const git = simpleGit();
    const remotes = await git.getRemotes(true);
    const origin = remotes.find((r) => r.name === 'origin');

    if (!origin || !origin.refs.fetch) return null;

    const repoUrl = origin.refs.fetch;
    const match = repoUrl.match(
      /github\.com[/:](.+?)\/(.+?)(\.git)?$/
    );
    if (!match) return null;

    return `${match[1]}/${match[2]}`;
  } catch {
    return null;
  }
}

export async function handleInit() {
  console.log('\n🧠 Let’s set up git-chimp 🐒\n');

  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const envPath = path.resolve(__dirname, '../../.env');

  if (fs.existsSync(envPath)) {
    console.log(
      chalk.yellow('⚠️  .env file already exists. Not overwriting.')
    );
    process.exit(1);
  }

  const openai = await ask('Enter your OpenAI API key: ');
  const github = await ask(
    'Enter your GitHub Personal Access Token: '
  );

  let inferredRepo = await getRepoFromGit();
  let repo = '';

  if (inferredRepo) {
    console.log(
      chalk.green(`✅ Inferred GitHub repo: ${inferredRepo}`)
    );
    const entered = await ask(
      `Enter your GitHub repo [${inferredRepo}]: `
    );
    repo = entered || inferredRepo;
  } else {
    console.log(
      chalk.yellow(
        '⚠️ Could not determine GitHub repo from Git config.'
      )
    );
    repo = await ask('Enter your GitHub repo (e.g. username/repo): ');
  }

  rl.close();

  const envVars = [
    `OPENAI_API_KEY=${openai}`,
    `GITHUB_TOKEN=${github}`,
    `# GITHUB_REPO is optional. Leave it blank to infer from the local Git config.`,
    `GITHUB_REPO=${repo}`,
  ].join(os.EOL);

  try {
    fs.writeFileSync(envPath, envVars + os.EOL);
    console.log(chalk.green(`\n✅ Configuration saved to .env`));
  } catch (err) {
    console.error(chalk.red('❌ Failed to write .env file:'), err);
  }
}
