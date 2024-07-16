export interface HubspotCompanyInput {
  city: string;
  name: string;
  phone: string;
  domain: string;
  industry: string;
  state: string;
  country: string;
  address: string;
  numberofemployees: string;
  zip: string;
  hubspot_owner_id?: string;
  [key: string]: any;
}

export interface HubspotCompanyOutput {
  id: string;
  properties: {
    city: string;
    createdate: string;
    domain: string;
    hs_lastmodifieddate: string;
    hubspot_owner_id: string;
    industry: string;
    name: string;
    phone: string;
    state: string;
    country: string;
    zip: string;
    address: string;
    numberofemployees: string;
    [key: string]: string;
  };
  createdAt: string;
  updatedAt: string;
  archived: boolean;
}

export const commonCompanyHubspotProperties = {
  city: '',
  createdate: '',
  domain: '',
  industry: '',
  name: '',
  phone: '',
  state: '',
  country: '',
  zip: '',
  address: '',
  hubspot_owner_id: '',
  numberofemployees: '',
};
