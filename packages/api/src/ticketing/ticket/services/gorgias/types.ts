export type GorgiasTicketOutput = {
  id: number;
  assignee_user: User | null;
  channel: string;
  closed_datetime: string | null; // ISO 8601 datetime
  created_datetime: string; // ISO 8601 datetime
  customer: Customer;
  external_id: string;
  from_agent: boolean;
  is_unread: boolean;
  language: string;
  last_message_datetime: string | null; // ISO 8601 datetime
  last_received_message_datetime: string | null; // ISO 8601 datetime
  messages: Partial<Message>[];
  meta: Meta;
  opened_datetime: string | null; // ISO 8601 datetime
  reply_options?: any; // Undefined type, could be specified more if structure is known
  satisfaction_survey: SatisfactionSurvey | null;
  snooze_datetime: string | null; // ISO 8601 datetime
  spam: boolean;
  status: string;
  subject: string;
  tags: Tag[];
  trashed_datetime: string | null; // ISO 8601 datetime
  updated_datetime: string | null; // ISO 8601 datetime
  via: string;
  uri: string;
};

export type GorgiasTicketInput = Partial<GorgiasTicketOutput>;

interface User {
  id: number;
}

interface Customer {
  id: number;
  // Additional customer properties as needed
}

interface Meta {
  [key: string]: any; // key-value storage
}

interface SatisfactionSurvey {
  id: number;
  body_text: string;
  created_datetime: string; // ISO 8601 datetime
  customer_id: number;
  meta: Meta; // Assuming Meta is a key-value store
  score: number; // Range from 1 to 5
  scored_datetime: string; // ISO 8601 datetime
  sent_datetime: string | null; // ISO 8601 datetime, nullable if not sent
  should_send_datetime: string | null; // ISO 8601 datetime, nullable if there's no schedule for sending
  ticket_id: number;
  uri: string;
}

interface Tag {
  name: string;
}

interface Message {
  id: number;
  attachments: Partial<Attachment>[] | string[];
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

interface Attachment {
  // Assuming structure for Attachment objects, add properties as needed
  url: string;
  name: string;
  size: number | null;
  content_type: string;
  public: boolean; // Assuming this field indicates if the attachment is public or not
  extra?: string; // Optional field for extra information
}

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
