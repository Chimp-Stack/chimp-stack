export function cleanCommitMessages(
  raw: string | string[]
): string[] {
  const lines = Array.isArray(raw) ? raw : raw.split('\n');
  return lines
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => line.replace(/^[-*\d.]+\s*/, '')); // Strips "-", "*", "1.", etc.
}
