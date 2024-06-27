export interface HubspotStageInput {
  [key: string]: any;
}

export interface HubspotStageOutput {
  stageId: string;
  createdAt: number;
  updatedAt: number | null;
  label: string;
  displayOrder: number;
  metadata: any;
  active: boolean;
}

export const commonStageHubspotProperties = {
  dealstage: '',
};
