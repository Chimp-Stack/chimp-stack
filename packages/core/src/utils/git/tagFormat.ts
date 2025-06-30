export function applyTagFormat(
  format: string,
  name: string,
  version: string
): string {
  return format
    .replace(/\$\{name\}/g, name)
    .replace(/\$\{version\}/g, version);
}

export function extractTagPrefixFromFormat(
  format: string,
  name: string
): string {
  return format
    .replace(/\$\{name\}/g, name)
    .replace(/\$\{version\}/g, '');
}
