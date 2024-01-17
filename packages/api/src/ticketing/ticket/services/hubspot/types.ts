export type HubspotTicketInput = {
  subject: string;
  hs_pipeline: string;
  hubspot_owner_id?: string;
  hs_pipeline_stage: string;
  hs_ticket_priority: string;
  [key: string]: any;
};

export type HubspotTicketOutput = {
  id: string;
  properties: TicketProperties;
  createdAt: string;
  updatedAt: string;
  archived: boolean;
};

export type TicketProperties = {
  createdate: string;
  hs_lastmodifieddate: string;
  hs_pipeline: string;
  hs_pipeline_stage: string;
  hs_ticket_priority: string;
  hubspot_owner_id: string;
  subject: string;
  [key: string]: string;
};

export const commonHubspotProperties = {
  createdate: '',
  hs_lastmodifieddate: '',
  hs_pipeline: '',
  hs_pipeline_stage: '',
  hs_ticket_priority: '',
  hubspot_owner_id: '',
  subject: '',
};
