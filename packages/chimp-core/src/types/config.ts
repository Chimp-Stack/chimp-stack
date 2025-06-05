export type ChimpConfig = {
  openaiApiKey?: string;
  githubToken?: string;
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
  changelog: boolean;
  prSummary: boolean;
  toc: boolean;
};
