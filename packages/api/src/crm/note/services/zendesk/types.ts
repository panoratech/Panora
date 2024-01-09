export interface ZendeskNote {
  id: number; // Unique identifier of the note
  creator_id: number; // Unique identifier of the user that created the note
  resource_type?: 'lead' | 'contact' | 'deal'; // Type name of the resource the note is attached to
  resource_id?: number; // Unique identifier of the resource the note is attached to
  content?: string; // Content of the note
  is_important?: boolean; // Indicator for whether the note has been starred or not
  tags?: string[]; // An array of tags for a note
  created_at: string; // Date and time of creation in UTC (ISO8601 format)
  updated_at: string; // Date and time of the last update in UTC (ISO8601 format)
  type?: 'regular' | 'restricted'; // Type
}

export type ZendeskNoteInput = Partial<ZendeskNote>;
export type ZendeskNoteOutput = ZendeskNoteInput;
