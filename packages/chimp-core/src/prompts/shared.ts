import input from '@inquirer/input';

export async function askSharedQuestions(
  location: 'global' | 'local'
) {
  const answers: Record<string, any> = {};

  if (location === 'global') {
    answers.openaiApiKey = await input({
      message: 'OpenAI API Key (only stored globally)',
    });
  }

  answers.githubToken = await input({
    message: 'GitHub Token (optional)',
  });

  answers.tagFormat = await input({
    message:
      'Custom git tag format (e.g., v{version}, @scope/pkg@{version})',
    default: '${name}@${version}',
  });

  return answers;
}
