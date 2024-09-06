export interface HubspotNoteInput {
  properties: {
    hs_note_body: string;
    hs_timestamp: string;
    hubspot_owner_id?: string;
    [key: string]: any;
  };
  associations?: {
    to: { id: string };
    type: {
      associationCategory: string;
      associationTypeId: number;
    }[];
  }[];
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
  associations?: {
    [key: string]: {
      results: [
        {
          id: string;
          type: string;
        },
      ];
    };
  };
}

export const commonNoteHubspotProperties = {
  hs_timestamp: '',
  hs_note_body: '',
  hubspot_owner_id: '',
  hs_attachment_ids: '',
};
