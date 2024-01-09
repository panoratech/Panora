export interface PipedriveNote {
  id: number;
  active_flag: boolean;
  add_time: string;
  content: string;
  deal: DealReference;
  lead_id: string;
  deal_id: number;
  last_update_user_id: number;
  org_id: number;
  organization: OrganizationReference;
  person: PersonReference;
  person_id: number;
  pinned_to_lead_flag: boolean;
  pinned_to_deal_flag: boolean;
  pinned_to_organization_flag: boolean;
  pinned_to_person_flag: boolean;
  update_time: string;
  user: UserReference;
  user_id: number;
  [key: string]: any;
}

export type PipedriveNoteInput = Partial<PipedriveNote>;
export type PipedriveNoteOutput = PipedriveNoteInput;

type DealReference = {
  title: string;
};

type OrganizationReference = {
  name: string;
};

type PersonReference = {
  name: string;
};

type UserReference = {
  email: string;
  icon_url: string;
  is_you: boolean;
  name: string;
};
