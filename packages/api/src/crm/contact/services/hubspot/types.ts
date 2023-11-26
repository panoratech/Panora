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

type HubspotPropertiesOuput = {
  createdate: string;
  email: string;
  firstname: string;
  hs_object_id: string;
  lastmodifieddate: string;
  lastname: string;
};
export interface HubspotContactOutput {
  id: string;
  properties: HubspotPropertiesOuput;
  createdAt: string;
  updatedAt: string;
  archived: boolean;
}
