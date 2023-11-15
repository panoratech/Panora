export interface ZendeskContactInput {
  contact_id: number;
  name: string;
  first_name: string;
  last_name: string;
  title: string;
  description: string;
  industry: string;
  website: string;
  email: string;
  phone: string;
  mobile: string;
  fax: string;
  twitter: string;
  facebook: string;
  linkedin: string;
  skype: string;
  address: Address;
  tags: string[];
  custom_fields: CustomFields;
  // Include any additional fields specific to Zendesk if needed
}
export interface ZendeskContactOutput {
  id: number;
  creator_id: number;
  owner_id: number;
  is_organization: boolean;
  contact_id: number;
  parent_organization_id: number | null;
  name: string;
  first_name: string;
  last_name: string;
  customer_status: string;
  prospect_status: string;
  title: string;
  description: string;
  industry: string;
  website: string;
  email: string;
  phone: string;
  mobile: string;
  fax: string;
  twitter: string;
  facebook: string;
  linkedin: string;
  skype: string;
  address: Address | null;
  billing_address: Address | null;
  shipping_address: Address | null;
  created_at: string; // or Date if you convert the string to a Date object
  updated_at: string; // or Date
  meta: Meta;
}

interface Meta {
  type: string;
}

interface Address {
  line1: string;
  city: string;
  postal_code: string;
  state: string;
  country: string;
}

interface CustomFields {
  referral_website: string;
  // Include any other custom fields as needed
}
