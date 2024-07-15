export type AshbyAttachmentInput = {
  candidateId: string;
  file: string;
};

export type AshbyAttachmentOutput = Partial<{
  id: string;
  name: string;
  handle: string;
  [key: string]: any;
}>;
