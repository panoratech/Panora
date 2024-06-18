export interface InputPhone {
  phone: string;
  type: string;
}

export interface InputEmail {
  email: string;
  type: string;
}

interface Url {
  url: string;
  type: string;
}

interface CustomFields {
  [key: string]: string; // Allows dynamic keys for custom fields
}

interface LeadInput {
  lead_id: string;
  name: string;
  title: string;
  phones: InputPhone[];
  emails: InputEmail[];
  urls: Url[];
  custom?: CustomFields;
}

interface Phone {
  country: string;
  phone: string;
  phone_formatted: string;
  type: string;
}

interface Email {
  type: string;
  email: string;
  is_unsubscribed: boolean;
}

interface Contact {
  id: string;
  organization_id: string;
  lead_id: string;
  name: string;
  title: string;
  phones: Phone[];
  emails: Email[];
  date_created: string;
  date_updated: string;
  created_by: string;
  updated_by: string;
}

export type CloseContactInput = Partial<LeadInput>;

export type CloseContactOutput = Partial<Contact>;

export const commonCloseProperties = {
  createdate: '',
  email: '',
  firstname: '',
  hs_object_id: '',
  lastmodifieddate: '',
  lastname: '',
  close_owner_id: '',
};
