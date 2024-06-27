export type JiraAttachmentOutput = {
  author: User;
  content: string;
  created: string;
  filename: string;
  id: string;
  mimeType: string;
  self: string;
  size: number;
  thumbnail?: string;
} & {
  [key: string]: any;
};

interface User {
  accountId: string;
  accountType?: string;
  active: boolean;
  avatarUrls?: AvatarUrls;
  displayName: string;
  key?: string;
  name?: string;
  self: string;
}

interface AvatarUrls {
  '16x16': string;
  '24x24': string;
  '32x32': string;
  '48x48': string;
}
