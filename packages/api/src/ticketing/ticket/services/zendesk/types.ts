export type ZendeskTicketInput = Partial<Base> & {
  comment: Partial<Comment>;
};

export type ZendeskTicketOutput = ZendeskTicketInput & {
  id: number; // Read-only. Automatically assigned when the ticket is created.
  created_at: string; // Read-only. When this record was created.
  description: string; // Read-only. Description of the ticket.
  due_at: string | null; // Read-only. Due date, if applicable.
  external_id: string; // Read-only. External identifier for the ticket.
  follower_ids: number[]; // Read-only. IDs of followers.
  from_messaging_channel: boolean; // Read-only. Indicates if from a messaging channel.
  has_incidents: boolean; // Read-only. Indicates if the ticket has incidents.
  organization_id: number; // Read-only. ID of the associated organization.
  problem_id: number; // Read-only. ID of the associated problem, if any.
  raw_subject: string; // Read-only. Raw subject of the ticket.
  recipient: string; // Read-only. Recipient email.
  satisfaction_rating: SatisfactionRating; // Read-only. Satisfaction rating.
  sharing_agreement_ids: number[]; // Read-only. IDs of sharing agreements.
  status: string; // Read-only. Status of the ticket.
  subject: string; // Read-only. Subject of the ticket.
  submitter_id: number; // Read-only. ID of the person who submitted the ticket.
  tags: string[]; // Read-only. Tags associated with the ticket.
  type: string; // Read-only. Type of the ticket.
  updated_at: string; // Read-only. When the record was last updated.
  url: string; // Read-only. URL of the ticket.
};

export type Base = {
  allow_attachments: boolean;
  allow_channelback: boolean;
  assignee_email?: string; // Write only
  assignee_id?: number;
  attribute_value_ids?: number[]; // Write only
  brand_id?: number; // Enterprise only
  collaborator_ids?: number[];
  collaborators?: Collaborator; // POST requests only
  created_at: string;
  custom_fields?: CustomField[];
  custom_status_id?: number;
  description: string; // Read-only
  due_at?: string | null;
  email_cc_ids?: number[];
  email_ccs?: EmailCc[]; // Write only
  external_id?: string;
  follower_ids?: number[];
  followers?: Follower[]; // Write only
  followup_ids?: number[];
  forum_topic_id?: number; // Web portal (deprecated)
  from_messaging_channel: boolean;
  group_id?: number;
  has_incidents: boolean;
  id: number;
  is_public: boolean;
  macro_id?: number; // Write only
  macro_ids?: number[]; // POST requests only
  metadata?: Metadata; // Write only
  organization_id?: number;
  priority?: string;
  problem_id?: number;
  raw_subject?: string;
  recipient?: string;
  requester?: Requester; // Write only
  requester_id?: number;
  safe_update?: boolean; // Write only
  satisfaction_rating?: SatisfactionRating;
  sharing_agreement_ids?: number[];
  status?: string;
  subject?: string;
  submitter_id?: number;
  tags?: string[];
  ticket_form_id?: number; // Enterprise only
  type?: string;
  updated_at: string;
  updated_stamp?: string; // Write only
  url: string;
  via?: Via;
  via_followup_source_id?: number; // POST requests only
  via_id?: number; // Write only
  voice_comment?: VoiceComment; // Write only
};

type Collaborator = [
  number, // Represents an integer, e.g., 562
  string, // Represents a string, e.g., "someone@example.com"
  {
    name: string; // Represents a name, e.g., "Someone Else"
    email: string; // Represents an email, e.g., "else@example.com"
  },
];

type Comment = {
  attachments: Attachment[]; // Read-only. Attachments, if any.
  audit_id: number; // Read-only. The id of the ticket audit record.
  author_id?: number; // The id of the comment author.
  body?: string; // The comment string.
  created_at: string; // Read-only. The time the comment was created.
  html_body?: string; // The comment formatted as HTML.
  id: number; // Read-only. Automatically assigned when the comment is created.
  metadata: Metadata; // Read-only. System information and comment flags.
  plain_body: string; // Read-only. The comment presented as plain text.
  public?: boolean; // true if a public comment; false if an internal note.
  type: 'Comment' | 'VoiceComment'; // Read-only. Either 'Comment' or 'VoiceComment'.
  uploads?: string[]; // List of tokens for comment attachments.
  via?: Via; // Describes how the object was created.
};

type Attachment = {
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
};

export type CustomField = {
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

type Follower = EmailCc;

type Metadata = Record<string, any>;

type Requester = {
  locale_id?: number;
  name: string;
  email: string;
};

type SatisfactionRating = string;

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

type VoiceComment = {
  from: string; // Incoming phone number
  to: string; // Dialed phone number
  recording_url: string; // URL of the recording
  started_at: string; // ISO 8601 timestamp of the call starting time
  call_duration: number; // Duration in seconds of the call
  answered_by_id: number; // The agent who answered the call
  transcription_text?: string; // Transcription of the call (optional)
  location?: string; // Location of the caller (optional)
};
