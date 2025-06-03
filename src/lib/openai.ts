import { config } from 'dotenv';
import type { DefaultLogFields, ListLogLine } from 'simple-git';
import OpenAI from 'openai';

config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

export async function generateCommitMessages(
  diff: string,
  count = 3,
  tone?: string,
  model: string = 'gpt-3.5-turbo'
): Promise<string[]> {
  const toneDescription = tone ? ` with a ${tone} tone` : '';
  const prompt = `
You are a helpful assistant that writes concise, conventional commit messages based on Git diffs${toneDescription}.

Here is the diff:
${diff}

Respond with ${count} different commit message options, each on its own line.
Messages should be short, use present tense, and follow conventional commit style.
  `;

  const completion = await openai.chat.completions.create({
    model,
    messages: [{ role: 'user', content: prompt }],
  });

  const raw = completion.choices[0].message.content?.trim() || '';
  const lines = raw.split('\n').filter((line) => line.trim() !== '');
  return lines.slice(0, count); // Just in case the model got a little too chatty
}

export async function generatePullRequestTitle(
  diff: string,
  currentBranch?: string,
  model: string = 'gpt-3.5-turbo'
): Promise<string> {
  const systemPrompt = `You are an assistant that generates semantic PR titles following the Conventional Commits format.`;
  const branchMessage = currentBranch
    ? `Branch: ${currentBranch}`
    : '';
  const userPrompt = `
Here is a git diff. Generate a semantic PR title (one line) based on the changes.
Only return the title, nothing else.
Examples:
- feat: add user authentication
- fix: correct API response formatting
- docs: update README with setup instructions

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
  model: string = 'gpt-3.5-turbo'
): Promise<string> {
  const toneDescription = tone ? ` with a ${tone} tone` : '';
  const prompt = `
You are a helpful assistant that writes professional pull request descriptions based on Git diffs${toneDescription}.

Here is the diff:
${diff}

Include a brief summary of the changes, mention any important context, and highlight anything reviewers should pay attention to. Use markdown formatting and keep it concise.
  `;

  const completion = await openai.chat.completions.create({
    model,
    messages: [{ role: 'user', content: prompt }],
  });

  return (
    completion.choices[0].message.content?.trim() ||
    'This PR contains general updates and improvements.'
  );
}

export async function generateChangelogEntries(
  commits: (DefaultLogFields & ListLogLine)[],
  tone = 'concise',
  model = 'gpt-4'
): Promise<string> {
  const messages = commits.map((c) => `- ${c.message}`).join('\n');

  const prompt = `You are a release manager. Given these commit messages, summarize the changes and write a professional changelog summary in a ${tone} tone:\n\n${messages}`;

  const response = await openai.chat.completions.create({
    messages: [{ role: 'user', content: prompt }],
    model,
  });

  return response.choices[0].message.content ?? '';
}
