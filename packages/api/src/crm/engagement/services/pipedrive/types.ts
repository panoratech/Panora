export interface PipedriveEngagement {
  id: number;
  company_id: number;
  user_id: number;
  done: boolean;
  type: string;
  reference_type: string;
  reference_id: number;
  conference_meeting_client: string;
  conference_meeting_url: string;
  conference_meeting_id: string;
  due_date: string;
  due_time: string;
  duration: string;
  busy_flag: boolean;
  add_time: string;
  marked_as_done_time: string;
  last_notification_time: string;
  last_notification_user_id: number;
  notification_language_id: number;
  subject: string;
  public_description: string;
  calendar_sync_include_context: string;
  location: string;
  org_id: number;
  person_id: number;
  deal_id: number;
  lead_id: string;
  project_id?: any;
  active_flag: boolean;
  update_time: string;
  update_user_id: number;
  gcal_event_id: string;
  google_calendar_id: string;
  google_calendar_etag: string;
  source_timezone: string;
  rec_rule: string;
  rec_rule_extension: string;
  rec_master_activity_id: number;
  series: any[];
  note: string;
  created_by_user_id: number;
  location_subpremise: string;
  location_street_number: string;
  location_route: string;
  location_sublocality: string;
  location_locality: string;
  location_admin_area_level_1: string;
  location_admin_area_level_2: string;
  location_country: string;
  location_postal_code: string;
  location_formatted_address: string;
  attendees: Attendee[];
  participants: Participant[];
  org_name: string;
  person_name: string;
  deal_title: string;
  owner_name: string;
  person_dropbox_bcc: string;
  deal_dropbox_bcc: string;
  assigned_to_user_id: number;
  file: File;
  [key: string]: any;
}

interface Attendee {
  email_address: string;
  is_organizer: number;
  name: string;
  person_id: number;
  status: string;
  user_id?: any;
}

interface Participant {
  person_id: number;
  primary_flag: boolean;
}

interface File {
  id: string;
  clean_name: string;
  url: string;
}

export type PipedriveEngagementInput = Partial<PipedriveEngagement>;
export type PipedriveEngagementOutput = PipedriveEngagementInput;
