export interface GorgiasCommentOutput {
  id: number;
  attachments: Attachment[];
  body_html: string;
  body_text: string;
  channel: string;
  created_datetime: string; // ISO 8601 datetime format
  external_id: string;
  failed_datetime: string | null; // ISO 8601 datetime format, nullable for successful messages
  from_agent: boolean;
  integration_id: number;
  last_sending_error?: string; // Assuming this can be undefined or string
  message_id: string;
  receiver: Receiver | null; // Optional, based on source type
  rule_id: number | null; // Assuming it can be null when no rule sent the message
  sender: Sender;
  sent_datetime: string; // ISO 8601 datetime format
  source: Source;
  stripped_html: string;
  stripped_text: string;
  subject: string;
  ticket_id: number;
  via: string;
  uri: string;
}

export type GorgiasCommentInput = Partial<GorgiasCommentOutput>;

type Attachment = {
  url: string;
  name: string;
  size: number | null;
  content_type: string;
  public: boolean; // Assuming this field indicates if the attachment is public or not
  extra?: string; // Optional field for extra information
} & {
  [key: string]: any;
};

interface Receiver {
  id: number;
  email?: string;
}

interface Sender {
  id: number;
  email?: string;
}

interface Source {
  type: string;
  from: Participant;
  to: Participant[];
  cc?: Participant[];
  bcc?: Participant[];
}

interface Participant {
  name: string;
  address: string;
}
