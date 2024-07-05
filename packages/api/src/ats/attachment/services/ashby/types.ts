export interface AshbyAttachmentInput {
  id: string;
  name: string;
  handle: string;
}

export type AshbyAttachmentOutput = Partial<AshbyAttachmentInput>;
