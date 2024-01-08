export type ZendeskAccountInput = {
  _: string;
};

export type ZendeskAccountOutput = ZendeskAccountInput & {
  id: number; // Read-only. Automatically assigned when the ticket is created.
};
