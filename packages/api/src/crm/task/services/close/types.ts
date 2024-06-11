export interface CloseTaskInput {
  _type: string;
  lead_id: string;
  assigned_to: string;
  text: string;
  date: string;
  is_complete: boolean;
}

interface LeadTask {
  _type: string;
  assigned_to: string;
  assigned_to_name: string;
  contact_id: string | null;
  contact_name: string | null;
  created_by: string;
  created_by_name: string;
  date: string;
  date_created: string;
  date_updated: string;
  id: string;
  is_complete: boolean;
  is_dateless: boolean;
  lead_id: string;
  lead_name: string;
  object_id: string | null;
  object_type: string | null;
  organization_id: string;
  text: string;
  updated_by: string;
  updated_by_name: string;
  due_date: string | null;
  finished_date: string | null;
}

export type CloseTaskOutput = Partial<LeadTask>;
