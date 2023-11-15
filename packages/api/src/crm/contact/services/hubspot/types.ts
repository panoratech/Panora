export interface HubspotContactInput {
  email?: string;
  firstname?: string;
  phone?: string;
  lastname?: string;
  city?: string;
  country?: string;
  zip?: string;
  state?: string;
  address?: string;
  mobilephone?: string;
  hubspot_owner_id?: string;
  associatedcompanyid?: string;
  fax?: string;
  jobtitle?: string;
}

export interface HubspotContactOutput {
  company: string;
  createdate: string; // Use 'Date' if you prefer a Date object
  email: string;
  firstname: string;
  lastmodifieddate: string; // Use 'Date' if you prefer a Date object
  lastname: string;
  phone: string;
  website: string;
}
