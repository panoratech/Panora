interface Call {
  lead_id: string;
  contact_id: string;
  created_by: string;
  user_id: string;
  direction: string;
  status: string;
  note_html?: string;
  note: string;
  duration: number;
  phone: string;
}

export type CloseEngagementCallInput = Partial<Call>;

interface OutputCall {
  id: string;
  _type: string;
  recording_url: string | null;
  voicemail_url: string | null;
  voicemail_duration: number | null;
  direction: string;
  disposition: string;
  source: string;
  note_html: string;
  note: string;
  duration: number;
  local_phone: string;
  local_phone_formatted: string;
  remote_phone: string;
  remote_phone_formatted: string;
  phone: string;
  created_by: string;
  updated_by: string;
  date_created: string;
  date_updated: string;
  organization_id: string;
  user_id: string;
  lead_id: string;
  contact_id: string;
  call_method: string;
  dialer_id: string | null;
  dialer_saved_search_id: string | null;
  cost: string;
  local_country_iso: string;
  remote_country_iso: string;
}

export type CloseEngagementCallOutput = Partial<OutputCall>;

export interface CloseEngagementMeetingInput {
  note_html?: string;
}

interface Meeting {
  id: string;
  _type: string;
  title: string;
  location: string;
  status: string;
  note: string;
  starts_at: string; // Date in ISO 8601 format
  ends_at: string; // Date in ISO 8601 format
  duration: number; // Duration of the meeting in seconds
  date_created: string; // Date in ISO 8601 format
  date_updated: string; // Date in ISO 8601 format
  created_by: string | null;
  created_by_name: string | null;
  updated_by: string | null;
  updated_by_name: string | null;
  user_id: string;
  user_name: string;
  organization_id: string;
  connected_account_id: string;
  source: string;
  is_recurring: boolean;
  lead_id: string | null;
  contact_id: string | null;
  attendees: Attendee[];
}

interface Attendee {
  status: string;
  user_id: string | null;
  name: string | null;
  contact_id: string | null;
  is_organizer: boolean;
  email: string;
}

export type CloseEngagementMeetingOutput = Partial<Meeting>;

export const commonMeetingCloseProperties = {
  createdate: '',
  hs_internal_meeting_notes: '',
  hs_lastmodifieddate: '',
  hs_meeting_body: '',
  hs_meeting_end_time: '',
  hs_meeting_external_url: '',
  hs_meeting_location: '',
  hs_meeting_outcome: '',
  hs_meeting_start_time: '',
  hs_meeting_title: '',
  hs_timestamp: '',
  close_owner_id: '',
};

interface Email {
  contact_id: string;
  user_id: string;
  lead_id: string;
  direction: string;
  created_by: string | null;
  created_by_name: string;
  date_created: string;
  subject: string;
  sender: string;
  to: string[];
  bcc: string[];
  cc: string[];
  status: string;
  body_text: string;
  body_html: string;
  attachments: Attachment[];
  email_account_id: string;
  template_id: string | null;
}

interface Attachment {
  url: string;
  filename: string;
  size: number;
  content_type: string;
}

export type CloseEngagementEmailInput = Partial<Email>;

interface EmailOuput {
  attachments: any[];
  body_text: string;
  date_updated: string;
  direction: string;
  contact_id: string;
  id: string;
  user_id: string;
  created_by: string | null;
  to: string[];
  subject: string;
  opens: any[];
  status: string;
  _type: string;
  updated_by: string;
  updated_by_name: string;
  envelope: Envelope;
  body_html: string;
  organization_id: string;
  body_text_quoted: BodyTextQuoted[];
  send_attempts: any[];
  lead_id: string;
  sender: string;
  bcc: any[];
  date_created: string;
  template_id: string | null;
  cc: any[];
  sequence_subscription_id: string;
  sequence_id: string;
  sequence_name: string;
}

interface Envelope {
  from: EmailAddress[];
  sender: EmailAddress[];
  to: EmailAddress[];
  cc: any[];
  bcc: any[];
  reply_to: any[];
  date: string;
  in_reply_to: any;
  message_id: string;
  subject: string;
}

interface EmailAddress {
  email: string;
  name: string;
}

interface BodyTextQuoted {
  text: string;
  expand: boolean;
}

// Example usage

export type CloseEngagementEmailOutput = Partial<EmailOuput>;

export const commonEmailCloseProperties = {
  createdate: '',
  hs_email_direction: '',
  hs_email_sender_email: '',
  hs_email_sender_firstname: '',
  hs_email_sender_lastname: '',
  hs_email_status: '',
  hs_email_subject: '',
  hs_email_text: '',
  hs_email_to_email: '',
  hs_email_to_firstname: '',
  hs_email_to_lastname: '',
  hs_lastmodifieddate: '',
  hs_timestamp: '',
  close_owner_id: '',
};

export type CloseEngagementInput =
  | CloseEngagementCallInput
  | CloseEngagementMeetingInput
  | CloseEngagementEmailInput;

export type CloseEngagementOutput =
  | CloseEngagementCallOutput
  | CloseEngagementMeetingOutput
  | CloseEngagementEmailOutput;
