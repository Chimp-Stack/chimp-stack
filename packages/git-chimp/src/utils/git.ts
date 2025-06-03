export function guessSemanticPrefix(diff: string): string {
  const lowerDiff = diff.toLowerCase();

  if (lowerDiff.includes('fix') || lowerDiff.includes('bug')) {
    return 'fix';
  }
  if (
    lowerDiff.includes('add') ||
    lowerDiff.includes('new feature')
  ) {
    return 'feat';
  }
  if (lowerDiff.includes('refactor')) {
    return 'refactor';
  }
  if (lowerDiff.includes('test') || lowerDiff.includes('jest')) {
    return 'test';
  }
  if (lowerDiff.includes('doc') || lowerDiff.includes('readme')) {
    return 'docs';
  }
  if (lowerDiff.includes('style')) {
    return 'style';
  }

  // Fall back to 'chore' if nothing matches
  return 'chore';
}

export function isConventionalCommit(msg: string): boolean {
  return /^(feat|fix|chore|docs|style|refactor|perf|test)(\([\w\-]+\))?: .+/.test(
    msg
  );
}
