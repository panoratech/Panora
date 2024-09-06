export type FrontCommentInput = {
  author_id?: string;
  body: string;
  attachments?: string[];
};

export type FrontCommentOutput = {
  _links: Links;
  id: string;
  author?: Author;
  body: string;
  posted_at: number;
  attachments?: Attachment[];
};

type Links = {
  self: string;
  related?: Record<string, string>;
};

type CustomFields = {
  [key: string]: string | boolean | number;
};

type Author = {
  _links: Links;
  id: string;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  is_admin: boolean;
  is_available: boolean;
  is_blocked: boolean;
  custom_fields: CustomFields;
};

type AttachmentMetadata = {
  is_inline: boolean;
  cid: string;
};

type Attachment = {
  id: string;
  filename: string;
  url: string;
  content_type: string;
  size: number;
  metadata: AttachmentMetadata;
} & {
  [key: string]: any;
};
