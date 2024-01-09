export interface FreshsalesTaskInput {
  first_name: string;
  last_name: string;
  mobile_number: string | string[];
}
export interface FreshsalesTaskOutput {
  id: number;
  first_name: string;
  last_name: string;
  display_name: string;
  avatar: string | null;
  job_title: string | null;
  city: string | null;
  state: string | null;
  zipcode: string | null;
  country: string | null;
  email: string | null;
  time_zone: string | null;
  work_number: string | null;
  mobile_number: string;
  address: string | null;
  last_seen: string | null;
  lead_score: number;
  last_contacted: string | null;
  open_engagements_amount: string;
  links: {
    conversations: string;
    activities: string;
  };
  custom_field: Record<string, unknown>;
  updated_at: string;
  keyword: string | null;
  medium: string | null;
  facebook: string | null;
  twitter: string | null;
  linkedin: string | null;
}
