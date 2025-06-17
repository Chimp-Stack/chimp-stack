import { bumpVersion } from '../src/utils/version.js';

describe('bumpVersion', () => {
  test('bumps patch version correctly', () => {
    expect(bumpVersion('1.2.3', 'patch')).toBe('1.2.4');
  });

  test('bumps minor version correctly', () => {
    expect(bumpVersion('1.2.3', 'minor')).toBe('1.3.0');
  });

  test('bumps major version correctly', () => {
    expect(bumpVersion('1.2.3', 'major')).toBe('2.0.0');
  });

  test('throws on invalid bump type', () => {
    // @ts-expect-error: we're intentionally passing bad input
    expect(() => bumpVersion('1.2.3', 'banana')).toThrow();
  });
});
