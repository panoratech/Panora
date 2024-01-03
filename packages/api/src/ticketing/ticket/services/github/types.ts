export type GithubTicketInput = {
  title: string;
  body?: string;
  assignee?: string | null;
  milestone?: string | number | null;
  labels?: string[];
  assignees?: string[];
};

//TODO
export type GithubTicketOutput = GithubTicketInput;
