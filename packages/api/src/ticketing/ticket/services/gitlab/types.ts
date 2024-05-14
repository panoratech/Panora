<<<<<<< HEAD
interface GitlabTicket {
    project_id: number
    id: number
    created_at: string
    iid: number
    title: string
    state: string
    assignees: any[]
    weight: any
    epic: Epic
    health_status: string
    assignee: any
    type: string
    labels: string[]
    upvotes: number
    downvotes: number
    merge_requests_count: number
    author: Author
    description: any
    updated_at: string
    closed_at: any
    closed_by: any
    milestone: any
    subscribed: boolean
    user_notes_count: number
    due_date: any
    web_url: string
    references: References
    time_stats: TimeStats
    confidential: boolean
    discussion_locked: boolean
    issue_type: string
    severity: string
    _links: Links
    task_completion_status: TaskCompletionStatus
}

interface Epic {
    id: number
    iid: number
    title: string
    url: string
    group_id: number
}

interface Author {
    name: string
    avatar_url: any
    state: string
    web_url: string
    id: number
    username: string
}

interface References {
    short: string
    relative: string
    full: string
}

interface TimeStats {
    time_estimate: number
    total_time_spent: number
    human_time_estimate: any
    human_total_time_spent: any
}

interface Links {
    self: string
    notes: string
    award_emoji: string
    project: string
    closed_as_duplicate_of: string
}

interface TaskCompletionStatus {
    count: number
    completed_count: number
}

export type GitlabTicketInput = Partial<GitlabTicket>;
export type GitlabTicketOutput = GitlabTicketInput;
=======
export type GitlabTicketInput = {
  title: string;
  body?: string;
  milestone?: string | number | null;
  labels?: string;
  assignee_id?: number;
  issue_type?: string;
  confidential?: boolean;
  assignee_ids?: number[];
  id: number;
  epic_id?: number;
  epic_iid?: number;
  weight?: number;
  due_date?: string;
  description?: string;
};

interface Author {
  name: string;
  avatar_url: string | null;
  state: 'active' | 'inactive';
  web_url: string;
  id: number;
  username: string;
}

interface References {
  short: string;
  relative: string;
  full: string;
}

interface TimeStats {
  time_estimate: number;
  total_time_spent: number;
  human_time_estimate: string | null;
  human_total_time_spent: string | null;
}

interface Links {
  self: string;
  notes: string;
  award_emoji: string;
  project: string;
  closed_as_duplicate_of: string;
}

interface TaskCompletionStatus {
  count: number;
  completed_count: number;
}

interface Issue {
  project_id: number;
  id: number;
  created_at: string;
  iid: number;
  title: string;
  state: 'opened' | 'closed';
  assignees: any[]; // You might want to define a type for assignees if needed
  assignee: any | null; // You might want to define a type for assignee if needed
  type: string;
  labels: string[];
  upvotes: number;
  downvotes: number;
  merge_requests_count: number;
  author: Author;
  description: string | null;
  updated_at: string;
  closed_at: string | null;
  closed_by: any | null; // You might want to define a type for closed_by if needed
  milestone: any | null; // You might want to define a type for milestone if needed
  subscribed: boolean;
  user_notes_count: number;
  due_date: string | null;
  web_url: string;
  references: References;
  time_stats: TimeStats;
  confidential: boolean;
  discussion_locked: boolean;
  issue_type: string;
  severity: string; // You might want to refine the severity levels
  _links: Links;
  task_completion_status: TaskCompletionStatus;
}

export type GitlabTicketOutput = Partial<Issue>;
>>>>>>> gitlab-connector-with-pagination-feat
