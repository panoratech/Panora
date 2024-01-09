export interface HubspotStageInput {
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
  [key: string]: any;
}

export interface HubspotStageOutput {
  id: string;
}
