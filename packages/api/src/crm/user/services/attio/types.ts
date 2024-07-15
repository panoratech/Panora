export interface AttioUserOutput {
  id: {
    workspace_id: string;
    workspace_member_id: string;
  };
  first_name: string;
  last_name: string;
  avatar_url: string;
  email_address: string;
  created_at: string;
  access_level: string;
}
