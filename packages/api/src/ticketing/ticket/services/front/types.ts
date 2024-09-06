export type FrontTicketInput = {
  type: 'discussion';
  inbox_id?: string;
  teammate_ids?: string[];
  subject: string;
  comment: Comment;
  custom_fields?: CustomFields;
  tags?: string[];
};

export type Comment = {
  author_id?: string;
  body: string;
  attachments?: string[];
};

export type FrontTicketOutput = Partial<Conversation>;

type Conversation = {
  _links: Link;
  id: string;
  subject: string;
  status: string;
  assignee: Assignee;
  recipient: Recipient;
  tags: Tag[];
  links: LinkItem[];
  custom_fields: CustomFields;
  created_at: number;
  is_private: boolean;
  scheduled_reminders: ScheduledReminder[];
  metadata: Metadata;
};

type Link = {
  self: string;
  related?: {
    [key: string]: string;
  };
};

type CustomFields = {
  [key: string]: string | boolean | number | null;
};

type Assignee = {
  _links: Link;
  id: string;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  is_admin: boolean;
  is_available: boolean;
  is_blocked: boolean;
  custom_fields: CustomFields;
};

type Recipient = {
  _links: {
    related: {
      contact: string;
    };
  };
  name: string;
  handle: string;
  role: string;
};

type Tag = {
  _links: Link;
  id: string;
  name: string;
  description: string;
  highlight: null | string;
  is_private: boolean;
  is_visible_in_conversation_lists: boolean;
  created_at: number;
  updated_at: number;
};

type LinkItem = {
  _links: Link;
  id: string;
  name: string;
  type: string;
  external_url: string;
  custom_fields: CustomFields;
};

type ScheduledReminder = {
  _links: {
    related: {
      owner: string;
    };
  };
  created_at: number;
  scheduled_at: number;
  updated_at: number;
};

type Metadata = {
  external_conversation_ids: string[];
};
