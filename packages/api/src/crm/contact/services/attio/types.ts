interface Actor {
  type: string;
  id: string | null;
}

interface Option {
  id: {
    workspace_id: string;
    object_id: string;
    attribute_id: string;
    option_id: string;
  };
  title: string;
  is_archived: boolean;
}

interface ValueItemBase {
  active_from?: string;
  active_until?: string | null;
  created_by_actor?: Actor;
  attribute_type?: string;
}

interface NumberValueItem extends ValueItemBase {
  value: number;
}

interface TextValueItem extends ValueItemBase {
  value: string;
}

interface InteractionValueItem extends ValueItemBase {
  interaction_type: string;
  interacted_at: string;
  owner_actor: Actor;
}

interface LocationValueItem extends ValueItemBase {
  line_1: string | null;
  line_2: string | null;
  line_3: string | null;
  line_4: string | null;
  locality: string | null;
  region: string | null;
  postcode: string | null;
  country_code: string | null;
  latitude: string | null;
  longitude: string | null;
}

interface RecordReferenceValueItem extends ValueItemBase {
  target_object: string;
  target_record_id: string;
}

interface RecordReferenceValueItem2 extends ValueItemBase {
  target_object: string;
  [key: string]: any;
}

interface ActorReferenceValueItem extends ValueItemBase {
  referenced_actor_type: string;
  referenced_actor_id: string;
}

interface EmailAddressValueItem extends ValueItemBase {
  original_email_address?: string;
  email_address: string;
  email_domain?: string;
  email_root_domain?: string;
  email_local_specifier?: string;
}

interface PhoneValueItem extends ValueItemBase {
  country_code?: string;
  original_phone_number: string;
  phone_number?: string;
}

interface PersonalNameValueItem extends ValueItemBase {
  first_name: string;
  last_name: string;
  full_name: string;
}

interface SelectValueItem extends ValueItemBase {
  option: Option;
}

export interface AttioContact {
  id: {
    workspace_id: string;
    object_id: string;
    record_id: string;
  };
  created_at: string;
  values: {
    strongest_connection_strength_legacy?: NumberValueItem[];
    last_interaction?: InteractionValueItem[];
    twitter?: TextValueItem[];
    avatar_url?: TextValueItem[];
    job_title?: TextValueItem[];
    next_calendar_interaction?: InteractionValueItem[];
    company?: RecordReferenceValueItem[] | RecordReferenceValueItem2[];
    primary_location?: LocationValueItem[];
    angellist?: TextValueItem[];
    description?: TextValueItem[];
    strongest_connection_user?: ActorReferenceValueItem[];
    strongest_connection_strength?: SelectValueItem[];
    last_email_interaction?: InteractionValueItem[];
    email_addresses?: EmailAddressValueItem[];
    first_interaction?: InteractionValueItem[];
    created_at?: ValueItemBase[];
    created_by?: ActorReferenceValueItem[];
    last_calendar_interaction?: InteractionValueItem[];
    linkedin?: TextValueItem[];
    facebook?: TextValueItem[];
    name?: PersonalNameValueItem[];
    first_calendar_interaction?: InteractionValueItem[];
    twitter_follower_count?: NumberValueItem[];
    instagram?: TextValueItem[];
    first_email_interaction?: InteractionValueItem[];
    phone_numbers?: PhoneValueItem[] | string[];
  };
}

export type AttioContactInput = Partial<AttioContact>;
export type AttioContactOutput = AttioContactInput;
