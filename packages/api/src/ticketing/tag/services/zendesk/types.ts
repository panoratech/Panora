export type ZendeskTagInput = {
  _: string;
};

export type ZendeskTagOutput = ZendeskTagInput & {
  id: number; // Read-only. Automatically assigned when the ticket is created.
};
