export type JiraCollectionInput = {
  avatarUrls?: Partial<AvatarUrls>;
  id: string;
  insight?: Insight;
  key: string;
  name: string;
  projectCategory?: ProjectCategory;
  self: string;
  simplified: boolean;
  style: string;
};

type AvatarUrls = {
  '16x16': string;
  '24x24': string;
  '32x32': string;
  '48x48': string;
};

type Insight = {
  lastIssueUpdateTime: string; // Consider using Date type if appropriate
  totalIssueCount: number;
};

type ProjectCategory = {
  description: string;
  id: string; // Or number if the ID is always numeric
  name: string;
  self: string;
};

export type JiraCollectionOutput = Partial<JiraCollectionInput>;
