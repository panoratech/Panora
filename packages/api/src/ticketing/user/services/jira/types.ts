export type JiraUserInput = {
  id: string;
};

export type JiraUserOutput = {
  accountId: string;
  accountType: string;
  active: boolean;
  avatarUrls: AvatarUrls;
  displayName: string;
  key: string;
  name: string;
  self: string;
} & {
  email: string;
};

type AvatarUrls = {
  '16x16': string;
  '24x24': string;
  '32x32': string;
  '48x48': string;
};
