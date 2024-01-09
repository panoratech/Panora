export type ZendeskContactInput = {
  _: string;
};

export type ZendeskContactOutput = Partial<{
  active: boolean;
  alias?: string;
  chat_only: boolean;
  created_at: string;
  custom_role_id?: number;
  default_group_id?: number;
  details?: string;
  email: string;
  external_id?: string;
  iana_time_zone: string;
  id: number;
  last_login_at: string;
  locale?: string;
  locale_id?: number;
  moderator?: boolean;
  name: string;
  notes?: string;
  only_private_comments?: boolean;
  organization_id?: number;
  phone?: string;
  photo?: { [key: string]: any }; // Assuming an object type for the Attachment object
  remote_photo_url?: string;
  report_csv: boolean;
  restricted_agent?: boolean;
  role?: string;
  role_type: number;
  shared: boolean;
  shared_agent: boolean;
  shared_phone_number?: boolean;
  signature?: string;
  suspended?: boolean;
  tags?: string[];
  ticket_restriction?:
    | 'organization'
    | 'groups'
    | 'assigned'
    | 'requested'
    | null;
  time_zone?: string;
  two_factor_auth_enabled: boolean;
  updated_at: string;
  url: string;
  user_fields?: { [key: string]: any }; // Assuming an object type for custom fields
  verified?: boolean;
}>;
