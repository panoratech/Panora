export type ZendeskTeamInput = {
  _: string;
};

export type ZendeskTeamOutput = ZendeskTeamInput & {
  id: number; // Read-only. Automatically assigned when the ticket is created.
};
