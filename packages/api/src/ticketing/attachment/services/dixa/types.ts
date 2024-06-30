export type DixaAttachmentOutput = {
  id: string;
  filename: string;
  url: string;
  content_type: string;
  size: number;
  metadata: AttachmentMetadata;
};

type AttachmentMetadata = {
  url: string;
  pretty_name: string;
};
