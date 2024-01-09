export type ZendeskAccountInput = {
  _: string;
};

export type ZendeskAccountOutput = {
  created_at: string; // The time the organization was created
  details?: string; // Any details about the organization, such as the address
  domain_names?: string[]; // An array of domain names associated with this organization
  external_id?: string; // A unique external id to associate organizations to an external record
  group_id?: number; // New tickets from users in this organization are automatically put in this group
  id: number; // Automatically assigned when the organization is created
  name: string; // A unique name for the organization
  notes?: string; // Any notes you have about the organization
  organization_fields?: { [key: string]: any }; // Custom fields for this organization
  shared_comments?: boolean; // End users in this organization are able to see each other's comments on tickets
  shared_tickets?: boolean; // End users in this organization are able to see each other's tickets
  tags?: string[]; // The tags of the organization
  updated_at: string; // The time of the last update of the organization
  url?: string; // The API url of this organization
};
