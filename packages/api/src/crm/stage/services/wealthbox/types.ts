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

interface Amount {
  amount: number
  currency: string
  kind: "Fee" | "Commission" | "AUM" | "Other"
}

export interface WealthboxStageInput {
  name: string;
  description: string;
  target_close: Date;
  probability: number
  stage: number
  manager: number
  amounts: Amount[]
  linked_to: LinkedTo[];
  visible_to: string;
  custom_fields: CustomField[]
}

export interface WealthboxStageOutput {
  id: number;
  creator: number;
  created_at: Date;
  updated_at: Date;
  name: string;
  description: string;
  target_close: Date
  probability: number
  stage: number
  manager: number
  amounts: Amount[]
  linked_to: LinkedTo[];
  visible_to: string;
  custom_fields: CustomField[];
}
