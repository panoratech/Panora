export interface HubspotDealInput {
  amount: string;
  dealname: string;
  pipeline: string;
  closedate: string;
  dealstage: string;
  hubspot_owner_id?: string;
  [key: string]: any;
}

export interface HubspotDealOutput {
  id: string;
  properties: {
    amount: string;
    closedate: string;
    createdate: string;
    dealname: string;
    dealstage: string;
    hs_lastmodifieddate: string;
    hubspot_owner_id: string;
    pipeline: string;
    [key: string]: any;
  };
  createdAt: string;
  updatedAt: string;
  archived: boolean;
}

export const commonDealHubspotProperties = {
  amount: '',
  closedate: '',
  createdate: '',
  dealname: '',
  dealstage: '',
  hubspot_owner_id: '',
  pipeline: '',
};
