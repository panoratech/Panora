interface Email {
  type: string;
  email: string;
}

interface Phone {
  type: string;
  phone: string;
}

interface Contact {
  name: string;
  title: string;
  emails: Email[];
  phones: Phone[];
}

interface Address {
  label: string;
  address_1: string;
  address_2: string;
  city: string;
  state: string;
  zipcode: string;
  country: string;
}

interface CustomFields {
  [key: string]: string | string[];
}

interface CompanyInput {
  name: string;
  url: string;
  description: string;
  status_id: string;
  contacts: Contact[];
  custom: CustomFields;
  addresses: Address[];
  status?: string;
}

export type CloseCompanyInput = Partial<CompanyInput>;

interface Phone {
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
  name: string;
  title: string;
  date_updated: string;
  phones: Phone[];
  custom: {
    [key: string]: string;
  };
  created_by: string | null;
  id: string;
  organization_id: string;
  date_created: string;
  emails: Email[];
  updated_by: string;
}

interface Opportunity {
  status_id: string;
  status_label: string;
  status_type: string;
  pipeline_id: string;
  pipeline_name: string;
  date_won: string | null;
  confidence: number;
  user_id: string;
  contact_id: string | null;
  updated_by: string | null;
  date_updated: string;
  value_period: string;
  created_by: string | null;
  note: string;
  value: number;
  value_formatted: string;
  value_currency: string;
  lead_name: string;
  organization_id: string;
  date_created: string;
  user_name: string;
  id: string;
  lead_id: string;
}

interface Lead {
  status_id: string;
  status_label: string;
  tasks: any[];
  display_name: string;
  addresses: Partial<Address>[];
  name: string;
  contacts: Contact[];
  custom: {
    [key: string]: string | string[];
  };
  date_updated: string;
  html_url: string;
  created_by: string | null;
  organization_id: string;
  url: string | null;
  opportunities: Opportunity[];
  updated_by: string;
  date_created: string;
  id: string;
  description: string;
}

export type CloseCompanyOutput = Partial<Lead>;

export const commonCompanyCloseProperties = {
  city: '',
  createdate: '',
  domain: '',
  industry: '',
  name: '',
  phone: '',
  state: '',
  close_owner_id: '',
};
