export interface ZendeskEngagementCall {
  id: number;
  user_id: number;
  summary: string;
  recording_url: string;
  outcome_id: number;
  duration: number;
  phone_number: string;
  incoming: boolean;
  missed: boolean;
  resource_type: string;
  resource_id: number;
  associated_deal_ids: number[];
  made_at: string;
  updated_at: string;
  external_id: string;
  meta: Meta;
}
interface Meta {
  type: string;
}

export type ZendeskEngagementInput = Partial<ZendeskEngagementCall>;

export type ZendeskEngagementOutput = ZendeskEngagementCall;
