export type FrontUserInput = {
  id: string;
};

export type FrontUserOutput = {
  _links: TeammateLink;
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

type TeammateLink = {
  self: string;
  related: {
    inboxes: string;
    conversations: string;
  };
};

type CustomFields = {
  [key: string]: string | boolean | number | null;
};
