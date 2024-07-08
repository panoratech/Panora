export interface AshbyAttachmentInput {
  id: string;
  name: string;
  handle: string;
  [key: string]: any;
}

export type AshbyAttachmentOutput = Partial<AshbyAttachmentInput>;
