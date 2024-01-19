export interface HubspotEngagementCallInput {
  hs_call_body: string;
  hs_timestamp: string;
  hs_call_title: string;
  hs_call_status: string;
  hs_call_duration: string;
  hs_call_direction: string;
  hubspot_owner_id: string;
  hs_call_to_number: string;
  hs_call_from_number: string;
  hs_call_recording_url: string;
  [key: string]: any;
}
export interface HubspotEngagementCallOutput {
  id: string;
  properties: {
    createdate: string;
    hs_call_body: string;
    hs_call_duration: string;
    hs_call_direction: string;
    hs_call_from_number: string;
    hs_call_recording_url: string;
    hs_call_status: string;
    hs_call_title: string;
    hs_call_to_number: string;
    hs_lastmodifieddate: string;
    hs_timestamp: string;
    hubspot_owner_id: string;
  };
  createdAt: string;
  updatedAt: string;
  archived: boolean;
}

export const commonCallHubspotProperties = {
  createdate: '',
  hs_call_body: '',
  hs_call_duration: '',
  hs_call_direction: '',
  hs_call_from_number: '',
  hs_call_recording_url: '',
  hs_call_status: '',
  hs_call_title: '',
  hs_call_to_number: '',
  hs_lastmodifieddate: '',
  hs_timestamp: '',
  hubspot_owner_id: '',
};
export interface HubspotEngagementMeetingInput {
  hs_timestamp: string;
  hs_meeting_body: string;
  hs_meeting_title: string;
  hubspot_owner_id: string;
  hs_meeting_outcome: string;
  hs_meeting_end_time: string;
  hs_meeting_location: string;
  hs_meeting_start_time: string;
  hs_meeting_external_url: string;
  hs_internal_meeting_notes: string;
  [key: string]: any;
}

export interface HubspotEngagementMeetingOutput {
  id: string;
  properties: {
    createdate: string;
    hs_internal_meeting_notes: string;
    hs_lastmodifieddate: string;
    hs_meeting_body: string;
    hs_meeting_end_time: string;
    hs_meeting_external_url: string;
    hs_meeting_location: string;
    hs_meeting_outcome: string;
    hs_meeting_start_time: string;
    hs_meeting_title: string;
    hs_timestamp: string;
    hubspot_owner_id: string;
  };
  createdAt: string;
  updatedAt: string;
  archived: boolean;
}

export const commonMeetingHubspotProperties = {
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
  hubspot_owner_id: '',
};

export interface HubspotEngagementEmailInput {
  hs_timestamp: string;
  hs_email_text: string;
  hs_email_status: string;
  hs_email_subject: string;
  hubspot_owner_id: string;
  hs_email_to_email: string;
  hs_email_direction: string;
  hs_email_to_lastname: string;
  hs_email_sender_email: string;
  hs_email_to_firstname: string;
  hs_email_sender_lastname: string;
  hs_email_sender_firstname: string;
  [key: string]: any;
}
export interface HubspotEngagementEmailOutput {
  id: string;
  properties: {
    createdate: string;
    hs_email_direction: string;
    hs_email_sender_email: string;
    hs_email_sender_firstname: string;
    hs_email_sender_lastname: string;
    hs_email_status: string;
    hs_email_subject: string;
    hs_email_text: string;
    hs_email_to_email: string;
    hs_email_to_firstname: string;
    hs_email_to_lastname: string;
    hs_lastmodifieddate: string;
    hs_timestamp: string;
    hubspot_owner_id: string;
  };
  createdAt: string;
  updatedAt: string;
  archived: boolean;
}

export const commonEmailHubspotProperties = {
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
  hubspot_owner_id: '',
};

export type HubspotEngagementInput =
  | HubspotEngagementCallInput
  | HubspotEngagementMeetingInput
  | HubspotEngagementEmailInput;

export type HubspotEngagementOutput =
  | HubspotEngagementCallOutput
  | HubspotEngagementMeetingOutput
  | HubspotEngagementEmailOutput;
