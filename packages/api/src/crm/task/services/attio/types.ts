interface Id {
  workspace_id: string;
  task_id: string;
}

interface LinkedRecord {
  target_object_id: string;
  target_record_id: string;
}

interface Assignee {
  referenced_actor_type: string;
  referenced_actor_id: string;
}

interface CreatedByActor {
  type: string;
  id: string;
}

export type AttioTaskOutput = {
  id: Id;
  content_plaintext: string;
  deadline_at: string;
  is_completed: boolean;
  linked_records: LinkedRecord[];
  assignees: Assignee[];
  created_by_actor: CreatedByActor;
  created_at: string;
};

export type AttioTaskInput = {
  data: {
    content: string;
    format: 'plaintext';
    deadline_at: string | null;
    is_completed: boolean;
    linked_records: {
      target_object: string;
      target_record_id: string;
    }[];
    assignees: {
      referenced_actor_type: 'workspace-member';
      referenced_actor_id: string;
    }[];
  };
};
