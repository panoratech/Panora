export interface HubspotTaskInput {
  hs_task_body: string;
  hs_timestamp: string;
  hs_task_status: string;
  hs_task_subject: string;
  hs_task_priority: string;
  hubspot_owner_id?: string;
  [key: string]: any;
  associations?: {
    to: { id: string };
    type: {
      associationCategory: string;
      associationTypeId: number;
    }[];
  }[];
}

export interface HubspotTaskOutput {
  id: string;
  properties: {
    createdate: string;
    hs_lastmodifieddate: string;
    hs_task_body: string;
    hs_task_priority: 'HIGH' | 'MEDIUM' | 'LOW'; // Assuming these are the only valid values for task priority
    hs_task_status: 'WAITING' | 'COMPLETED' | 'IN_PROGRESS'; // Assuming these are the valid statuses for task status
    hs_task_subject: string;
    hs_timestamp: string;
    hubspot_owner_id: string;
    [key: string]: any;
  };
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
  createdAt: string;
  updatedAt: string;
  archived: boolean;
}

export const commonTaskHubspotProperties = {
  hs_task_body: '',
  hs_task_priority: '',
  hs_task_status: '',
  hs_task_subject: '',
  hubspot_owner_id: '',
};
