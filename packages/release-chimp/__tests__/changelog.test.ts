import {
  jest,
  describe,
  test,
  expect,
  beforeEach,
} from '@jest/globals';
import path from 'path';

const existsSync = jest.fn();
const writeFileSync = jest.fn();
const appendFileSync = jest.fn();

jest.unstable_mockModule('node:fs', () => ({
  default: {
    existsSync,
    writeFileSync,
    appendFileSync,
  },
}));

const { writeChangelog, generateChangelog } = await import(
  '../src/utils/changelog.js'
);

describe('generateChangelog', () => {
  test('returns changelog string with version and date', () => {
    const result = generateChangelog('1.2.3');
    expect(result).toMatch(/## \[1\.2\.3\] - \d{4}-\d{2}-\d{2}/);
  });
});

describe('writeChangelog', () => {
  const mockPath = path.resolve(process.cwd(), 'CHANGELOG.md');

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('creates a new changelog if it does not exist', () => {
    existsSync.mockReturnValue(false);
    writeFileSync.mockImplementation(() => {});

    writeChangelog('1.2.3');

    expect(writeFileSync).toHaveBeenCalledWith(
      mockPath,
      expect.stringContaining('## [1.2.3]')
    );
  });

  test('appends to existing changelog', () => {
    existsSync.mockReturnValue(true);
    appendFileSync.mockImplementation(() => {});

    writeChangelog('1.2.3');

    expect(appendFileSync).toHaveBeenCalledWith(
      mockPath,
      expect.stringContaining('## [1.2.3]')
    );
  });
});
