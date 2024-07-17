interface NoteInput {
  note: string;
  note_html?: string;
  lead_id: string;
  attachments?: Attachment[];
}

interface Attachment {
  content_type: string;
  filename: string;
  url: string;
}

export type CloseNoteInput = Partial<NoteInput>;

interface Note {
  organization_id: string;
  _type: 'Note';
  user_id: string;
  user_name: string;
  updated_by: string;
  updated_by_name: string;
  date_updated: string;
  created_by: string;
  created_by_name: string;
  note_html: string;
  note: string;
  attachments: Attachment[];
  contact_id: string | null;
  date_created: string;
  id: string;
  lead_id: string;
}

interface Attachment {
  content_type: string;
  filename: string;
  size: number;
  url: string;
  thumbnail_url: string;
}

export type CloseNoteOutput = Partial<Note>;
