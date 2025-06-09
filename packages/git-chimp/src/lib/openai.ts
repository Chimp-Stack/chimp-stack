import { loadChimpConfig, GitChimpConfig } from 'chimp-core';
import OpenAI from 'openai';

let _openai: OpenAI | null = null;

export function getOpenAIInstance(): OpenAI {
  if (!_openai) {
    const config = loadChimpConfig('gitChimp') as GitChimpConfig;
    const apiKey =
      config.openaiApiKey || process.env.OPENAI_API_KEY || '';

    if (!apiKey) {
      console.error(
        '❌ Missing OpenAI API key. Please set it in your .chimprc or in the OPENAI_API_KEY environment variable.'
      );
      process.exit(1);
    }

    _openai = new OpenAI({
      apiKey,
    });
  }

  return _openai;
}

export async function generateCommitMessages(
  diff: string,
  count = 3,
  enforceConventionalCommits = false,
  tone?: string,
  model = 'gpt-3.5-turbo',
  scope?: string
): Promise<string[]> {
  const openai = getOpenAIInstance();

  const scopeInstruction = scope
    ? ` Use the scope "${scope}" in the commit messages (format: type(${scope}): description).`
    : '';

  const systemPrompt = enforceConventionalCommits
    ? `You are an assistant that strictly generates Conventional Commit messages. Messages must follow the Conventional Commits specification and format.${scopeInstruction}`
    : `You are a helpful assistant that writes clear, concise Git commit messages based on Git diffs.${scopeInstruction}`;

  const toneDescription =
    !enforceConventionalCommits && tone
      ? ` with a ${tone} tone.`
      : '';

  const userPrompt = `
Here is the diff:
${diff}

Respond with ${count} different commit message options, each on its own line.
Messages should be short, use present tense.${enforceConventionalCommits ? ' They MUST follow Conventional Commit style.' : ''}${toneDescription}
`;

  const completion = await openai.chat.completions.create({
    model,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
  });

  const raw = completion.choices[0].message.content?.trim() || '';
  const lines = raw.split('\n').filter((line) => line.trim() !== '');
  return lines.slice(0, count);
}

export async function generatePullRequestTitle(
  diff: string,
  currentBranch?: string,
  enforceSemanticPrTitles = false,
  tone?: string,
  model = 'gpt-3.5-turbo'
): Promise<string> {
  const openai = getOpenAIInstance();

  const systemPrompt = enforceSemanticPrTitles
    ? `You are an assistant that strictly generates semantic PR titles following the Conventional Commits format. The title must be a single line in Conventional Commits format.`
    : `You are an assistant that generates clear and useful PR titles.`;

  const toneDescription =
    !enforceSemanticPrTitles && tone ? ` with a ${tone} tone` : '';

  const branchMessage = currentBranch
    ? `Branch: ${currentBranch}`
    : '';

  const userPrompt = `
Here is a git diff. Generate a PR title (one line) based on the changes.
Only return the title, nothing else.
${enforceSemanticPrTitles ? 'It MUST follow the Conventional Commits format.' : ''}
${toneDescription}

Git diff:
${diff}

${branchMessage}
`;

  const res = await openai.chat.completions.create({
    model,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.2,
  });

  return (
    res.choices[0].message.content?.trim() ??
    'chore: update something'
  );
}

export async function generatePullRequestDescription(
  diff: string,
  tone?: string,
  model = 'gpt-3.5-turbo'
): Promise<string> {
  const openai = getOpenAIInstance();

  const systemPrompt = `You are an assistant that writes professional and helpful pull request descriptions.`;

  const toneDescription = tone ? ` with a ${tone} tone` : '';

  const userPrompt = `
Here is the diff:
${diff}

Include a brief summary of the changes, mention any important context, and highlight anything reviewers should pay attention to. Use markdown formatting and keep it concise.${toneDescription}
`;

  const completion = await openai.chat.completions.create({
    model,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
  });

  return (
    completion.choices[0].message.content?.trim() ||
    'This PR contains general updates and improvements.'
  );
}

export async function generateChangelogEntries(
  commits: { message: string }[],
  tone = 'concise',
  model = 'gpt-4'
): Promise<string> {
  const openai = getOpenAIInstance();

  const systemPrompt = `You are a release manager. You write professional changelog entries.`;

  const messages = commits.map((c) => `- ${c.message}`).join('\n');

  const userPrompt = `
Given these commit messages, summarize the changes and write a professional changelog summary in a ${tone} tone:

${messages}
`;

  const response = await openai.chat.completions.create({
    model,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
  });

  return response.choices[0].message.content ?? '';
}
