export type FrontAttachmentOutput = {
  id: string;
  filename: string;
  url: string;
  content_type: string;
  size: number;
  metadata: AttachmentMetadata;
} & {
  [key: string]: any;
};
type AttachmentMetadata = {
  is_inline: boolean;
  cid: string;
};
