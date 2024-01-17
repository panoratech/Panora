export interface HubspotNoteInput {
  hs_note_body: string;
  hs_timestamp: string;
  hubspot_owner_id?: string;
  [key: string]: any;
}

export interface HubspotNoteOutput {
  id: string;
  properties: {
    createdate: string;
    hs_lastmodifieddate: string;
    hs_note_body: string;
    hs_timestamp: string;
    hubspot_owner_id: string;
    [key: string]: any;
  };
  createdAt: string;
  updatedAt: string;
  archived: boolean;
}

export const commonNoteHubspotProperties = {
  hs_timestamp: '',
  hs_note_body: '',
  hubspot_owner_id: '',
  hs_attachment_ids: '',
};
