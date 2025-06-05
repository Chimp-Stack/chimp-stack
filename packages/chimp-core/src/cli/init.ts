import { Command } from 'commander';
import inquirer from 'inquirer';
import { writeChimpConfig } from '../config';

export function addChimpInitCommand(
  program: Command,
  scope: 'gitChimp' | 'docChimp'
) {
  const initCommand = new Command('init')
    .description(`Create or update .chimprc config for ${scope}`)
    .action(async () => {
      const { location } = await inquirer.prompt([
        {
          type: 'list',
          name: 'location',
          message: 'Where should the config be saved?',
          choices: [
            { name: 'Global (~/.chimprc)', value: 'global' },
            { name: 'Local (./.chimprc)', value: 'local' },
          ],
        },
      ]);

      const sharedAnswers = await inquirer.prompt([
        {
          type: 'input',
          name: 'openaiApiKey',
          message: 'OpenAI API Key (only stored globally)',
          when: () => location === 'global',
        },
        {
          type: 'input',
          name: 'githubToken',
          message: 'GitHub Token (optional)',
        },
      ]);

      let scopedAnswers: Record<string, any> = {};

      if (scope === 'gitChimp') {
        scopedAnswers = await inquirer.prompt([
          {
            type: 'list',
            name: 'model',
            message: 'Which OpenAI model?',
            choices: [
              'gpt-3.5-turbo',
              'gpt-4',
              'gpt-4o',
              'gpt-4o-mini',
            ],
          },
          {
            type: 'list',
            name: 'tone',
            message: 'What tone should commit/PR messages have?',
            choices: [
              'neutral',
              'friendly',
              'sarcastic',
              'enthusiastic',
            ],
          },
          {
            type: 'confirm',
            name: 'enforceConventionalCommits',
            message: 'Enforce Conventional Commits?',
            default: true,
          },
          {
            type: 'confirm',
            name: 'enforceSemanticPrTitles',
            message: 'Enforce semantic PR titles?',
            default: true,
          },
          {
            type: 'list',
            name: 'prMode',
            message: 'Default PR mode?',
            choices: ['open', 'draft', 'display'],
          },
        ]);
      }

      if (scope === 'docChimp') {
        scopedAnswers = await inquirer.prompt([
          {
            type: 'input',
            name: 'include',
            message: 'Include globs (comma separated)',
            default: 'src/**/*',
            filter: (input) =>
              input.split(',').map((s: string) => s.trim()),
          },
          {
            type: 'input',
            name: 'exclude',
            message: 'Exclude globs (comma separated)',
            default: 'node_modules,dist',
            filter: (input) =>
              input.split(',').map((s: string) => s.trim()),
          },
          {
            type: 'input',
            name: 'outputDir',
            message: 'Output directory for generated docs',
            default: 'docs',
          },
          {
            type: 'confirm',
            name: 'changelog',
            message: 'Include changelog content?',
            default: true,
          },
          {
            type: 'confirm',
            name: 'prSummary',
            message: 'Include PR summary content?',
            default: true,
          },
          {
            type: 'confirm',
            name: 'toc',
            message: 'Generate table of contents?',
            default: true,
          },
        ]);
      }

      if (location === 'global') {
        writeChimpConfig(sharedAnswers, { location });
      }

      writeChimpConfig(scopedAnswers, { location, scope });

      console.log(
        `🎉 Saved ${scope} config to ${location === 'global' ? '~/.chimprc' : './.chimprc'}`
      );
    });

  program.addCommand(initCommand);
}
