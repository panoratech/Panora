interface Id {
  workspace_id: string;
  object_id: string;
  record_id: string;
}

interface CreatedByActor {
  type: string;
  id: string | null;
}

interface NameValue {
  active_from: string;
  active_until: string | null;
  created_by_actor: CreatedByActor;
  value: string;
  attribute_type: string;
}

interface StatusId {
  workspace_id: string;
  object_id: string;
  attribute_id: string;
  status_id: string;
}

interface Status {
  title: string;
  id: StatusId;
  is_archived: boolean;
  celebration_enabled: boolean;
  target_time_in_status: string | null;
}

interface StageValue {
  active_from: string;
  active_until: string | null;
  created_by_actor: CreatedByActor;
  status: Status;
  attribute_type: string;
}

interface OwnerValue {
  active_from: string;
  active_until: string | null;
  created_by_actor: CreatedByActor;
  referenced_actor_type: string;
  referenced_actor_id: string;
  attribute_type: string;
}

interface CurrencyValue {
  active_from: string;
  active_until: string | null;
  created_by_actor: CreatedByActor;
  currency_value: number;
  currency_code: string;
  attribute_type: string;
}

interface RecordReferenceValue {
  active_from: string;
  active_until: string | null;
  created_by_actor: CreatedByActor;
  target_object: string;
  target_record_id: string;
  attribute_type: string;
}

interface Values {
  name: NameValue[];
  stage: StageValue[];
  owner: OwnerValue[];
  value: CurrencyValue[];
  associated_people: RecordReferenceValue[];
  associated_company: RecordReferenceValue[];
}

export type AttioDealOutput = {
  id: Partial<Id>;
  created_at: string;
  values: Values;
};

export type AttioDealInput = {
  values: Partial<{
    name: {
      value: string;
    }[];
    stage: any[];
    owner: {
      referenced_actor_type: 'workspace-member';
      referenced_actor_id: string;
    }[];
    value: {
      currency_value: number;
    }[];
    associated_people: any[];
    associated_company: {
      target_object: string;
      target_record_id: string;
    }[];
  }>;
};
