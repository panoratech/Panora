export type ZendeskCommentInput = Partial<BaseComment>;

export type ZendeskCommentOutput = ZendeskCommentInput & {
  id: number;
};

type BaseComment = {
  attachments: Attachment[]; // Read-only. Attachments, if any.
  audit_id: number; // Read-only. The id of the ticket audit record.
  author_id?: number; // The id of the comment author.
  body?: string; // The comment string.
  created_at: string; // Read-only. The time the comment was created.
  html_body?: string; // The comment formatted as HTML.
  metadata: Metadata; // Read-only. System information and comment flags.
  plain_body: string; // Read-only. The comment presented as plain text.
  public?: boolean; // true if a public comment; false if an internal note.
  type: 'Comment' | 'VoiceComment'; // Read-only. Either 'Comment' or 'VoiceComment'.
  uploads?: string[]; // List of tokens for comment attachments.
  via?: Via; // Describes how the object was created.
};

export type Attachment = {
  content_type: string; // The content type of the image, e.g., "image/png".
  content_url: string; // A full URL where the attachment image file can be downloaded.
  deleted: boolean; // If true, the attachment has been deleted.
  file_name: string; // The name of the image file.
  height: string | null; // The height of the image file in pixels, or null if unknown.
  id: number; // Automatically assigned when created.
  inline: boolean; // If true, the attachment is excluded from the attachment list.
  malware_access_override: boolean; // If true, you can download an attachment flagged as malware.
  malware_scan_result:
    | 'malware_found'
    | 'malware_not_found'
    | 'failed_to_scan'
    | 'not_scanned'; // The result of the malware scan.
  mapped_content_url: string; // The URL the attachment image file has been mapped to.
  size: number; // The size of the image file in bytes.
  thumbnails: Attachment[]; // An array of attachment objects.
  url: string; // A URL to access the attachment details.
  width: string | null; // The width of the image file in pixels, or null if unknown.
} & {
  [key: string]: any;
};

export type CustomField_ = {
  id: string;
  value: any;
};

//48 ccs MAX otherwise 404 error
type EmailCc =
  | {
      user_email: string;
      user_name?: string;
      user_id?: never;
      action?: 'put' | 'delete';
    }
  | {
      user_email?: never;
      user_name?: never;
      user_id: string;
      action?: 'put' | 'delete';
    };

type Metadata = Record<string, any>;

type Via = {
  channel: string;
  source:
    | EmailSource
    | WebSource
    | ZendeskWidgetSource
    | FeedbackTabSource
    | MobileSource
    | ApiSource
    | FollowUpSource
    | BusinessRuleTriggerSource
    | BusinessRuleAutomationSource
    | ForumTopicSource
    | SocialMediaSource
    | ChatSource
    | ChatOfflineMessageSource
    | CallSource
    | FacebookSource
    | SystemMergedSource
    | SystemFollowUpSource
    | SystemSuspendedTicketSource
    | SystemProblemTicketSolvedSource
    | AnyChannelSource;
  rel?: string;
};

type EmailSource = {
  from: EmailDetails;
  to: EmailDetails;
  original_recipients?: string[];
};

type EmailDetails = {
  address: string;
  name?: string;
  email_ccs?: EmailCc[];
};

type WebSource = any; // "Submit a request" on website has no additional details

type ZendeskWidgetSource = {
  zendesk_widget: any; // Replace 'any' with actual structure if available
};

type FeedbackTabSource = {
  feedback_tab: any; // Replace 'any' with actual structure if available
};

type MobileSource = {
  mobile: any; // Replace 'any' with actual structure if available
};

type ApiSource = {
  api: any; // Replace 'any' with actual structure if available
};

type FollowUpSource = {
  ticket_id: number;
  subject: string;
};

type BusinessRuleTriggerSource = {
  id: number;
  title: string;
  deleted?: boolean;
  revision_id?: number; // Enterprise
};

type BusinessRuleAutomationSource = {
  id: number;
  title: string;
  deleted?: boolean;
};

type ForumTopicSource = {
  topic_id: number;
  topic_name: string;
};

type SocialMediaSource = {
  profile_url: string;
  username: string;
  name?: string;
};

type ChatSource = any; // Chat has no additional details

type ChatOfflineMessageSource = {
  chat_offline_message: any; // Replace 'any' with actual structure if available
};

type CallSource = {
  phone: string;
  formatted_phone: string;
  name?: string;
};

type FacebookSource = {
  name: string;
  profile_url: string;
  facebook_id: string;
};

type SystemMergedSource = {
  ticket_id: number;
  subject: string;
};

type SystemFollowUpSource = {
  ticket_id: number;
  subject: string;
};

type SystemSuspendedTicketSource = {
  suspended_ticket_id: number;
};

type SystemProblemTicketSolvedSource = {
  ticket_id: number;
  subject: string;
};

type AnyChannelSource = {
  service_info: any; // Replace 'any' with actual structure if available
  supports_channelback: boolean;
  supports_clickthrough: boolean;
  registered_integration_service_name: string;
};
