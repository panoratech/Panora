interface CustomFields {
  [key: string]: string;
}

export interface CloseDealInput {
  note?: string;
  confidence?: number;
  lead_id: string;
  status_id?: string;
  value?: number;
  value_period?: string;
  custom?: CustomFields;
}

interface Opportunity {
  id: string;
  organization_id: string;
  lead_id: string;
  lead_name: string;
  status_id: string;
  status_label: string;
  status_type: string;
  pipeline_id: string;
  pipeline_name: string;
  value: number;
  value_period: string;
  value_formatted: string;
  value_currency: string;
  expected_value: number;
  annualized_value: number;
  annualized_expected_value: number;
  date_won: string | null;
  confidence: number;
  note: string;
  user_id: string;
  user_name: string;
  contact_id: string | null;
  created_by: string;
  updated_by: string;
  date_updated: string;
  date_created: string;
  custom: CustomFields;
}

export type CloseDealOutput = Partial<Opportunity>;
