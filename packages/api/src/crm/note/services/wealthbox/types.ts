interface LinkedTo {
  id: number;
  type: string;
  name?: string;
}

export interface WealthboxNoteInput {
  content: string
  linked_to?: LinkedTo[]
  visible_to?: string
  tags?: string[]
}

export interface WealthboxNoteOutput {
  id: number
  creator: number
  created_at: Date
  updated_at: Date
  content: string
  linked_to: LinkedTo[]
  visible_to: string
  tags: string[]
}