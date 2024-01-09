export interface ZendeskDeal {
  id: number;
  creator_id: number;
  owner_id?: number;
  name?: string;
  value: number | string; // Could be either number or string depending on the presence of decimal part
  currency?: string;
  hot?: boolean;
  stage_id?: number;
  last_stage_change_at?: string;
  last_stage_change_by_id: number;
  last_activity_at: string;
  source_id?: number;
  loss_reason_id?: number;
  unqualified_reason_id?: number;
  dropbox_email: string;
  contact_id?: number;
  organization_id: number;
  estimated_close_date?: string;
  customized_win_likelihood?: number;
  tags?: string[];
  custom_fields: Record<string, any>;
  created_at: string;
  updated_at: string;
  added_at: string;
}

export type ZendeskDealInput = Partial<ZendeskDeal>;
export type ZendeskDealOutput = ZendeskDealInput;
