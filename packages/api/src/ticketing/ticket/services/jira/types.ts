export type JiraTicketInput = Partial<Issue>;
export type JiraTicketOutput = Issue; //Partial<JiraTicketInput>;

interface AvatarUrls {
  '16x16': string;
  '24x24': string;
  '32x32': string;
  '48x48': string;
}

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

interface Comment {
  author: User;
  body: any;
  created: string;
  id: string;
  self: string;
  updateAuthor: User;
  updated: string;
  visibility: Visibility;
}

interface Visibility {
  identifier: string;
  type: string;
  value: string;
}

type Attachment = {
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

interface IssueLink {
  id: string;
  inwardIssue?: Issue;
  outwardIssue?: Issue;
  type: LinkType;
}

interface LinkType {
  id: string;
  inward: string;
  name: string;
  outward: string;
}

interface Worklog {
  author: User;
  comment: any;
  id: string;
  issueId: string;
  self: string;
  started: string;
  timeSpent: string;
  timeSpentSeconds: number;
  updateAuthor: User;
  updated: string;
  visibility: Visibility;
}

interface Project {
  avatarUrls: AvatarUrls;
  id: string;
  insight?: ProjectInsight;
  key: string;
  name: string;
  projectCategory?: ProjectCategory;
  self: string;
  simplified: boolean;
  style: string;
}

interface ProjectInsight {
  lastIssueUpdateTime: string;
  totalIssueCount: number;
}

interface ProjectCategory {
  description: string;
  id: string;
  name: string;
  self: string;
}

interface Issue {
  expand: string;
  fields: Partial<{
    assignee: Partial<{ id: string }>;
    watcher: Partial<Watcher>;
    attachment: Attachment[];
    'sub-tasks': Partial<SubTask>[];
    description: any;
    project: Partial<Project>;
    comment: Partial<Comment>[];
    issuelinks: Partial<IssueLink>[];
    worklog: Partial<Worklog>[];
    issuetype: Partial<{ id: string; name: string }>;
    summary: string;
    labels: string[];
    status: Partial<{
      name: string;
      description: string;
      [key: string]: any;
    }>;
    priority: Partial<{
      id: string;
      name: string;
      iconUrl: string;
      self: string;
    }>;
    duedate: string;
  }>;
  id: string;
  key: string;
  self: string;
  [key: string]: any;
}

interface Watcher {
  isWatching: boolean;
  self: string;
  watchCount: number;
  watchers: User[];
}

interface SubTask {
  id: string;
  outwardIssue?: Issue;
  type: LinkType;
}
