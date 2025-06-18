import select from '@inquirer/select';
import confirm from '@inquirer/confirm';

export async function askReleaseChimpQuestions() {
  const bumpType = await select({
    message: 'What type of version bump do you want to perform?',
    choices: [
      { name: 'Patch (0.0.1)', value: 'patch' },
      { name: 'Minor (0.1.0)', value: 'minor' },
      { name: 'Major (1.0.0)', value: 'major' },
    ],
    default: 'patch',
  });

  const dryRun = await confirm({
    message:
      'Do you want to preview changes without writing files or committing?',
    default: false,
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
    noPackageJson,
    noChangelog,
    noGit,
  };
}
