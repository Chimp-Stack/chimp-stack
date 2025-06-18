import input from '@inquirer/input';
import confirm from '@inquirer/confirm';

export async function askDocChimpQuestions() {
  const include = await input({
    message: 'Include globs (comma separated)',
    default: 'src/**/*',
  });

  const exclude = await input({
    message: 'Exclude globs (comma separated)',
    default: 'node_modules,dist',
  });

  const outputDir = await input({
    message: 'Output directory for generated docs',
    default: 'docs',
  });

  const format = await input({
    message: 'Output format for generated docs',
    default: 'markdown',
  });

  const changelog = await confirm({
    message: 'Include changelog content?',
    default: true,
  });

  const prSummary = await confirm({
    message: 'Include PR summary content?',
    default: true,
  });

  const toc = await confirm({
    message: 'Generate table of contents?',
    default: true,
  });

  return {
    include: include.split(',').map((s) => s.trim()),
    exclude: exclude.split(',').map((s) => s.trim()),
    outputDir,
    format,
    changelog,
    prSummary,
    toc,
  };
}
