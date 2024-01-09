export type ZendeskTeamInput = {
  _: string;
};

export type ZendeskTeamOutput = {
  created_at: string; // The time the group was created
  default: boolean; // If the group is the default one for the account
  deleted: boolean; // Deleted groups get marked as such
  description?: string; // The description of the group
  id: number; // Automatically assigned when creating groups
  is_public?: boolean; // If true, the group is public. If false, the group is private
  name: string; // The name of the group
  updated_at: string; // The time of the last update of the group
  url: string; // The API url of the group
};
