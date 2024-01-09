export interface ZendeskCompany {
  owner_id: number;
  created_at: string;
  description: string | null;
  industry: string | null;
  billing_address: string | null;
  linkedin: string | null;
  title: string;
  contact_id: number;
  skype: string | null;
  twitter: string | null;
  shipping_address: string | null;
  id: number;
  fax: string | null;
  is_organization: boolean;
  first_name: string;
  email: string;
  prospect_status: string;
  website: string | null;
  address: Address;
  facebook: string | null;
  mobile: string;
  last_name: string;
  tags: Tag[];
  custom_field_values: CustomFieldValue[];
  phone: string;
  customer_status: string;
  name: string;
  creator_id: number;
  meta: Meta;
  custom_fields: Record<string, any>;
}

export type ZendeskCompanyInput = Partial<ZendeskCompany>;
export type ZendeskCompanyOutput = ZendeskCompanyInput;

type TagData = {
  name: string;
  resource_type: string;
  id: number;
};

type TagMeta = {
  type: string;
};

type Tag = {
  data: TagData;
  meta: TagMeta;
};

type PreviousEvent = {
  title: string;
};

type Meta = {
  event_id: string;
  event_cause: string;
  sequence: number;
  event_time: string;
  event_type: string;
  previous: PreviousEvent;
  type: string;
};

interface Address {
  line1: string;
  city: string;
  postal_code: string;
  state: string;
  country: string;
}

type CustomFieldData = {
  name: string;
  resource_type: string;
  id: number;
  type: string;
};

type CustomFieldMeta = {
  type: string;
};

type CustomFieldValue = {
  value: boolean;
  custom_field: {
    data: CustomFieldData;
    meta: CustomFieldMeta;
  };
};
