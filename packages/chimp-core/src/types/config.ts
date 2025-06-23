export type ChimpConfig = {
  openaiApiKey?: string;
  githubToken?: string;
  tagFormat?: string;
  [key: string]: any;
};

export type GitChimpConfig = ChimpConfig & {
  enforceSemanticPrTitles?: boolean;
  enforceConventionalCommits?: boolean;
  model?: 'gpt-3.5-turbo' | 'gpt-4' | 'gpt-4o' | 'gpt-4o-mini';
  prMode?: 'open' | 'draft' | 'display';
  tone?:
    | 'neutral'
    | 'friendly'
    | 'sarcastic'
    | 'enthusiastic'
    | string;
  changelog?: {
    useAI?: boolean;
    groupOrder?: string[];
  };
};

export type DocChimpConfig = ChimpConfig & {
  include: string[];
  exclude: string[];
  outputDir: string;
  format: 'json' | 'markdown';
  changelog: boolean;
  prSummary: boolean;
  toc: boolean;
};

export type ReleaseChimpConfig = ChimpConfig & {
  bumpType?: 'major' | 'minor' | 'patch';
  changelog?: {
    path?: string; // Default: 'CHANGELOG.md'
    useAI?: boolean;
    groupOrder?: string[];
  };
  dryRun?: boolean;
  noPackageJson?: boolean;
  noChangelog?: boolean;
  noGit?: boolean;
};
