interface GitlabComment {
  id: number;
  body: string;
  attachment: any;
  author: Author;
  created_at: string;
  updated_at: string;
  system: boolean;
  noteable_id: number;
  noteable_type: string;
  project_id: number;
  noteable_iid: number;
  resolvable: boolean;
  confidential: boolean;
  internal: boolean;
  imported: boolean;
  imported_from: string;
}

interface Author {
  id: number;
  username: string;
  email: string;
  name: string;
  state: string;
  created_at: string;
}

export type GitlabCommentInput = Partial<GitlabComment>;
export type GitlabCommentOutput = GitlabCommentInput;
