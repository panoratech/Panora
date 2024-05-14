export type BaseComment = {
  id: string;
  created: string;
  type: string | null;
  body: any;
  attachment: any;
  author: {
    id: string;
    username: string;
    name: string;
    state: string;
    avatar_url: string;
    web_url: string;
  };
  created_at: string;
  updated_at: string;
  system: boolean;
  confidential: boolean;
  noteable_id: number;
  noteable_type: string;
  project_id: number;
  noteable_iid: number;
  resolvable: boolean;
  internal: boolean;
  imported: boolean;
  imported_from: string;
};

export type GitlabCommentInput = Partial<BaseComment>;

export type GitlabCommentOutput = GitlabCommentInput & {
  id: number;
};
