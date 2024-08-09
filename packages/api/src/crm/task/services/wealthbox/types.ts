interface LinkedTo {
  id: number;
  type: string;
  name: string;
}

interface CustomField {
  id: number;
  name?: string;
  value: string;
  document_type?: string;
  field_type?: string;
}

export interface WealthboxTaskInput {
  name: string;
  due_date: Date;
  complete: boolean;
  category: number;
  linked_to: LinkedTo[];
  priority: string;
  visible_to: string;
  custom_fields: CustomField[];
  assigned_to: number;
  description: string;
}

export interface WealthboxTaskOutput {
  id: number;
  creator: number;
  created_at: Date;
  updated_at: Date;
  name: string;
  due_date: Date;
  complete: boolean;
  category: number;
  linked_to: LinkedTo[];
  priority: string;
  visible_to: string;
  custom_fields: CustomField[];
  frame: string;
  repeats: boolean;
  completer: number;
  description: string;
  description_html: string;
  assigned_to: number;
}

export const commonTaskWealthboxProperties = {
  resource_id: "",
  resource_type: "",
  assigned_to: "",
  assigned_to_team: "",
  created_by: "",
  completed: "",
}
