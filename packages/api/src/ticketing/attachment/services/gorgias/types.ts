export type GorgiasAttachmentOutput = {
  url: string;
  name: string;
  size: number | null;
  content_type: string;
  public: boolean; // Assuming this field indicates if the attachment is public or not
  extra?: string; // Optional field for extra information
} & {
  [key: string]: any;
};
export type GorgiasAttachmentInput = Partial<GorgiasAttachmentOutput>;
