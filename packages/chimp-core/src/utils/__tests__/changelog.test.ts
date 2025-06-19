import { describe, test, expect, vi, beforeEach } from 'vitest';
import { generateSemanticChangelog } from '../changelog';

vi.mock('simple-git', async () => {
  const actual = await vi.importActual('simple-git');
  return {
    ...actual,
    simpleGit: () => ({
      log: vi.fn().mockResolvedValue({
        all: [
          { message: 'feat(core): add banana parser' },
          { message: 'fix(api): off-by-one in coconut splitter' },
          { message: 'docs: update README with fruit table' },
        ],
      }),
    }),
  };
});

vi.mock('../../config', async () => {
  const actual = await vi.importActual('../../config');
  return {
    ...actual,
    loadChimpConfig: vi.fn().mockResolvedValue({
      changelog: {
        groupOrder: ['feat', 'fix', 'docs'],
      },
      tone: 'concise',
      model: 'gpt-4',
    }),
  };
});

describe('generateSemanticChangelog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('returns structured changelog with grouped entries', async () => {
    const changelog = await generateSemanticChangelog({
      from: 'v1.0.0',
      to: 'HEAD',
      toolName: 'releaseChimp',
      useAI: false,
    });

    expect(changelog).toContain('## Changelog (v1.0.0 → HEAD)');
    expect(changelog).toContain('### Features');
    expect(changelog).toContain('add banana parser');
    expect(changelog).toContain('### Bug Fixes');
    expect(changelog).toContain('off-by-one in coconut splitter');
    expect(changelog).toContain('### Documentation');
    expect(changelog).toContain('update README with fruit table');
  });
});
