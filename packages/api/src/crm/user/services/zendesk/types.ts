export interface ZendeskUser {
  id: number; // Unique identifier of the user
  name?: string; // Full name of the user
  email?: string; // Email address of the user
  status: 'active' | 'inactive'; // Status of the user's account
  invited: boolean; // Indicates whether an invitation has been sent to the user or not
  confirmed: boolean; // Indicates whether the user's account has been confirmed or not
  phone_number?: string; // Contact phone number of the user
  role: 'user' | 'admin'; // Role of the user
  roles?: UserRole[]; // An array of roles assigned to the user
  team_name: string; // Name of the team the user belongs to
  group: UserGroup; // Group the user belongs to
  reports_to: number; // Unique identifier of the manager of the user
  timezone?: string; // Timezone of the user
  created_at: string; // Date and time of creation in UTC (ISO8601 format)
  updated_at: string; // Date and time of the last update in UTC (ISO8601 format)
  deleted_at: string; // Date and time of deletion in UTC (ISO8601 format) in case the user has been deleted
  zendesk_user_id: string; // Zendesk user ID if linked to a Zendesk account
  identity_type?: 'person' | 'integration'; // T
}

export type ZendeskUserInput = Partial<ZendeskUser>;
export type ZendeskUserOutput = ZendeskUserInput;

type UserRole = {
  id: number;
  name: string;
};

type UserGroup = {
  id: number;
  name: string;
};
