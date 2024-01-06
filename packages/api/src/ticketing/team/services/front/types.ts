export type FrontTeamInput = {
  id: string;
};

export type FrontTeamOutput = {
  _links: TeamLink;
  id: string;
  name: string;
  inboxes: Inbox[];
  members: TeamMember[];
};

type TeamLink = {
  self: string;
  related?: {
    teammates?: string;
    conversations?: string;
    channels?: string;
    owner?: string;
  };
};

type CustomFields = {
  [key: string]: string | boolean | number | null;
};

type Inbox = {
  _links: TeamLink;
  id: string;
  name: string;
  is_private: boolean;
  custom_fields: CustomFields;
};

type TeamMember = {
  _links: TeamLink;
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
