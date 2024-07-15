export type AttioNoteOutput = {
  id: {
    workspace_id: string;
    note_id: string;
  };
  parent_object: string;
  parent_record_id: string;
  title: string;
  content_plaintext: string;
  created_by_actor: {
    type: string;
    id: string;
  };
  created_at: string;
};

export type AttioNoteInput = {
  data: {
    parent_object: string;
    parent_record_id: string;
    title: string;
    format: string;
    content: string;
    created_at?: string;
  };
};
