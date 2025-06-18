import select from '@inquirer/select';
import confirm from '@inquirer/confirm';
import input from '@inquirer/input';
import { ReleaseChimpConfig } from 'src/types/config';

export async function askReleaseChimpQuestions(): Promise<ReleaseChimpConfig> {
  const choices = [
    { name: 'Patch (0.0.1)', value: 'patch' },
    { name: 'Minor (0.1.0)', value: 'minor' },
    { name: 'Major (1.0.0)', value: 'major' },
  ] as const;

  const bumpType = await select({
    message: 'What type of version bump do you want to perform?',
    choices,
    default: 'patch',
  });

  const dryRun = await confirm({
    message:
      'Do you want to preview changes without writing files or committing?',
    default: false,
  });

  const tagFormat = await input({
    message:
      'Custom git tag format (e.g., v{version}, @scope/pkg@{version})',
    default: 'v{version}',
  });

  const changelogPath = await input({
    message: 'Path to changelog file (e.g., CHANGELOG.md)',
    default: 'CHANGELOG.md',
  });

  const changelogUseAI = await confirm({
    message: 'Use AI to help generate changelog?',
    default: false,
  });

  const changelogGroupOrder = await input({
    message: 'Custom changelog group order (comma separated)',
    default: 'Added,Changed,Fixed,Chores',
  });

  const noPackageJson = await confirm({
    message: 'Skip updating package.json version?',
    default: false,
  });

  const noChangelog = await confirm({
    message: 'Skip generating and writing changelog?',
    default: false,
  });

  const noGit = await confirm({
    message: 'Skip git commit, tag, and push?',
    default: false,
  });

  return {
    bumpType,
    dryRun,
    tagFormat,
    noPackageJson,
    noChangelog,
    noGit,
    changelog: {
      path: changelogPath,
      useAI: changelogUseAI,
      groupOrder: changelogGroupOrder
        ? changelogGroupOrder.split(',').map((s) => s.trim())
        : [],
    },
  };
}
