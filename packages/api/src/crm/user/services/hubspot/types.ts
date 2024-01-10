//TODO
export interface HubspotUserInput {
  [key: string]: any;
}

export interface HubspotUserOutput {
  id: string; // Unique identifier of the user
  email: string; // Email address of the user
  roleId: string; // Unique identifier of the user's role
  primaryTeamId: string; // Unique identifier of the primary team of the user
  secondaryTeamIds: string[]; // Array of unique identifiers for the secondary teams of the user
  superAdmin: boolean; // Indicator of w
  [key: string]: any;
}
