export interface CloseStageInput {
  email?: string;
  firstname?: string;
  phone?: string;
  lastname?: string;
  city?: string;
  country?: string;
  zip?: string;
  state?: string;
  address?: string;
  mobilephone?: string;
  close_owner_id?: string;
  associatedcompanyid?: string;
  fax?: string;
  jobtitle?: string;
  [key: string]: any;
}

interface OpportunityStatusChange {
  organization_id: string;
  _type: string;
  contact_id: string | null;
  created_by: string;
  created_by_name: string;
  date_created: string;
  date_updated: string;
  lead_id: string;
  new_status_id: string;
  new_status_label: string;
  new_status_type: string;
  new_pipeline_id: string;
  old_status_id: string;
  old_status_label: string;
  old_status_type: string;
  old_pipeline_id: string;
  opportunity_date_won: string;
  opportunity_id: string;
  opportunity_value: number;
  opportunity_value_formatted: string | null;
  opportunity_value_currency: string;
  updated_by: string;
  updated_by_name: string;
  user_id: string;
  user_name: string;
  id: string;
}

export type CloseStageOutput = Partial<OpportunityStatusChange>;

export const commonStageCloseProperties = {
  dealstage: '',
};
