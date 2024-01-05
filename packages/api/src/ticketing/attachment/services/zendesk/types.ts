export type ZendeskAttachmentInput = {
  _: string;
};

export type ZendeskAttachmentOutput = ZendeskAttachmentInput & {
  id: number; // Read-only. Automatically assigned when the ticket is created.
};
