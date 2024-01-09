export interface HubspotCompanyInput {
  city: string;
  name: string;
  phone: string;
  state: string;
  domain: string;
  industry: string;
  [key: string]: any;
}

export interface HubspotCompanyOutput {
  id: string;
  properties: {
    city: string;
    createdate: string;
    domain: string;
    hs_lastmodifieddate: string;
    industry: string;
    name: string;
    phone: string;
    state: string;
    [key: string]: string;
  };
  createdAt: string;
  updatedAt: string;
  archived: boolean;
}
