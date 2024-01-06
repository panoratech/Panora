export type FrontContactInput = {
  id: string;
};

export type FrontContactOutput = {
  _links: ContactLink;
  id: string;
  name: string;
  description: string;
  avatar_url: string;
  is_spammer: boolean;
  links: string[][];
  groups: Group[];
  handles: Handle[];
  custom_fields: {
    [key: string]: string | boolean;
  };
  is_private: boolean;
};

type ContactLink = {
  self: string;
  related: {
    notes?: string;
    conversations?: string;
    owner?: string | null;
  };
};

type Group = {
  _links: ContactLink;
  id: string;
  name: string;
  is_private: boolean;
};

type Handle = {
  handle: string;
  source: string;
};
