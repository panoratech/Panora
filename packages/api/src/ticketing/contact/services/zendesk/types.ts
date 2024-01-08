export type ZendeskContactInput = {
  _: string;
};

export type ZendeskContactOutput = ZendeskContactInput & {
  id: number; // Read-only. Automatically assigned when the ticket is created.
};
