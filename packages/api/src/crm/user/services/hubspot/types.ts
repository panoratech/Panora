export interface HubspotUserInput {
  [key: string]: any;
}

export interface HubspotUserOutput {
  id: string;
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  archived: boolean;
  teams: any[];
  [key: string]: any;
}

export const commonUserHubspotProperties = {
  email: '',
  firstName: '',
  lastName: '',
  archived: '',
  teams: '',
};
