export type JiraCommentInput = {
  body: any;
  [key: string]: any;
};

export type JiraCommentOutput = JiraCommentInput & {
  id: string;
  created: string;
  updated: string;
  self: string;
  author: {
    accountId: string;
    active: boolean;
    displayName: string;
    self: string;
  };
};
