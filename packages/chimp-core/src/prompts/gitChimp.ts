import confirm from '@inquirer/confirm';
import select from '@inquirer/select';

export async function askGitChimpQuestions() {
  return {
    model: await select({
      message: 'Which OpenAI model?',
      choices: [
        { name: 'gpt-3.5-turbo', value: 'gpt-3.5-turbo' },
        { name: 'gpt-4', value: 'gpt-4' },
        { name: 'gpt-4o', value: 'gpt-4o' },
        { name: 'gpt-4o-mini', value: 'gpt-4o-mini' },
      ],
    }),
    tone: await select({
      message: 'What tone should commit/PR messages have?',
      choices: [
        { name: 'Neutral', value: 'neutral' },
        { name: 'Friendly', value: 'friendly' },
        { name: 'Sarcastic', value: 'sarcastic' },
        { name: 'Enthusiastic', value: 'enthusiastic' },
      ],
    }),
    enforceConventionalCommits: await confirm({
      message: 'Enforce Conventional Commits?',
      default: true,
    }),
    enforceSemanticPrTitles: await confirm({
      message: 'Enforce semantic PR titles?',
      default: true,
    }),
    prMode: await select({
      message: 'Default PR mode?',
      choices: [
        { name: 'Open', value: 'open' },
        { name: 'Draft', value: 'draft' },
        { name: 'Display only', value: 'display' },
      ],
    }),
  };
}
