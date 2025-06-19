import { Command } from 'commander';
import { writeChimpConfig } from '../config';
import select from '@inquirer/select';
import { askSharedQuestions } from 'src/prompts/shared';
import { askGitChimpQuestions } from 'src/prompts/gitChimp';
import { askDocChimpQuestions } from 'src/prompts/docChimp';
import { askReleaseChimpQuestions } from 'src/prompts/releaseChimp';

export function addChimpInitCommand(
  program: Command,
  scope: 'gitChimp' | 'docChimp' | 'releaseChimp'
) {
  const initCommand = new Command('init')
    .description(`Create or update .chimprc config for ${scope}`)
    .action(async () => {
      const choices = [
        { name: 'Global (~/.chimprc)', value: 'global' },
        { name: 'Local (./.chimprc)', value: 'local' },
      ] as const;

      const location = await select({
        message: 'Where should the config be saved?',
        choices,
      });

      const sharedAnswers = await askSharedQuestions(location);

      let scopedAnswers: Record<string, any> = {};

      if (scope === 'gitChimp') {
        scopedAnswers = await askGitChimpQuestions();
      }

      if (scope === 'docChimp') {
        scopedAnswers = await askDocChimpQuestions();
      }

      if (scope === 'releaseChimp') {
        scopedAnswers = await askReleaseChimpQuestions();
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
