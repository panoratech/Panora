export interface BoxUserInput {
  id: string;
  type: 'user';
  name: string;
  login: string;
  created_at: string;
  modified_at: string;
  language: string;
  timezone: string;
  space_amount: number;
  space_used: number;
  max_upload_size: number;
  status: string;
  job_title: string;
  phone: string;
  address: string;
  avatar_url: string;
  notification_email: BoxUserNotificationEmail;
  role: string;
  tracking_codes: BoxUserTrackingCode[];
  can_see_managed_users: boolean;
  is_sync_enabled: boolean;
  is_external_collab_restricted: boolean;
  is_exempt_from_device_limits: boolean;
  is_exempt_from_login_verification: boolean;
  enterprise: BoxUserEnterprise;
  my_tags: string[];
  hostname: string;
  is_platform_access_only: boolean;
  external_app_user_id: string;
}

export type BoxUserOutput = Partial<BoxUserInput>;

export interface BoxUserNotificationEmail {
  email: string;
  is_confirmed: boolean;
}

export interface BoxUserTrackingCode {
  type: 'tracking_code';
  name: string;
  value: string;
}

export interface BoxUserEnterprise {
  id: string;
  type: 'enterprise';
  name: string;
}
