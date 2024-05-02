interface WorkspaceId {
  workspace_id: string;
  object_id: string;
  record_id: string;
}

interface CreatedByActor {
  type: string;
  id: string | null;
}

interface ValueItemBase {
  active_from?: string;
  active_until?: string | null;
  created_by_actor?: CreatedByActor;
  attribute_type?: string;
}

interface NumberValueItem extends ValueItemBase {
  value: number;
}

interface TextValueItem extends ValueItemBase {
  value: string;
}

interface DomainValueItem extends ValueItemBase {
  domain: string;
  root_domain?: string;
}

interface LocationValueItem extends ValueItemBase {
  line_1: string | null;
  line_2: string | null;
  line_3: string | null;
  line_4: string | null;
  locality: string | null;
  region: string | null;
  postcode: string | null;
  latitude: string | null;
  longitude: string | null;
  country_code: string | null;
}

interface TeamValueItemOption1 extends ValueItemBase {
  target_object: string;
  target_record_id: string;
}

interface TeamValueItemOption2 extends ValueItemBase {
  target_object: string;
  [key: string]: any;
}

interface CategoryValueItem extends ValueItemBase {
  option: string | Option;
}

interface StrongConnectionValueItem extends ValueItemBase {
  referenced_actor_type: string;
  referenced_actor_id: string;
}

interface OptionId {
  workspace_id: string;
  object_id: string;
  attribute_id: string;
  option_id: string;
}

interface Option {
  id: OptionId;
  title: string;
  is_archived: boolean;
}

interface ActorReference extends ValueItemBase {
  referenced_actor_type: string;
  referenced_actor_id: string;
}

interface OwnerActor {
  type: string;
  id: string;
}

interface Interaction extends ValueItemBase {
  interaction_type: string;
  interacted_at: string;
  owner_actor: OwnerActor;
}

export interface AttioCompany {
  id: WorkspaceId;
  created_at: string;
  values: {
    domains?: DomainValueItem[];
    name?: TextValueItem[];
    description?: TextValueItem[];
    team?: TeamValueItemOption1[] | TeamValueItemOption2[];
    primary_location?: LocationValueItem[];
    categories?: CategoryValueItem[];
    logo_url?: TextValueItem[];
    twitter_follower_count?: NumberValueItem[];
    foundation_date?: TextValueItem[];
    strongest_connection_user?: StrongConnectionValueItem[];
    estimated_arr_usd?: CategoryValueItem[];
    strongest_connection_strength_legacy?: NumberValueItem[];
    employee_range?: CategoryValueItem[];
    twitter?: TeamValueItemOption1[];
    angellist?: TextValueItem[];
    facebook?: TextValueItem[];
    linkedin?: TextValueItem[];
    instagram?: TextValueItem[];
    strongest_connection_strength?: CategoryValueItem[];
    last_calendar_interaction?: Interaction[];
    last_email_interaction?: Interaction[];
    first_interaction?: Interaction[];
    first_email_interaction?: Interaction[];
    first_calendar_interaction?: Interaction[];
    next_calendar_interaction?: Interaction[];
    last_interaction?: Interaction[];
    created_at?: TextValueItem[];
    created_by?: ActorReference[];
  };
}

export type AttioCompanyInput = Partial<AttioCompany>;
export type AttioCompanyOutput = AttioCompanyInput;
