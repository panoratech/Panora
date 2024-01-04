export type ZendeskUserInput = {
  _: string;
};

export type ZendeskUserOutput = ZendeskUserInput & {
  id: number; // Read-only. Automatically assigned when the ticket is created.
};
