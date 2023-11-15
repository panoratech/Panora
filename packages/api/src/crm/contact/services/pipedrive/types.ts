export interface PipedriveContactInput {
  name: string;
  owner_id?: number;
  org_id?: number;
  email: string | EmailObject[];
  phone: string | PhoneObject[];
  label?: number;
  visible_to?: VisibleTo;
  marketing_status?: MarketingStatus;
  add_time?: string;
}

export interface PipedriveContactOutput {
  id: number;
  company_id: number;
  owner_id: User;
  org_id: OrgId;
  name: string;
  first_name: string;
  last_name: string;
  // ... other properties
  phone: Phone[];
  email: Email[];
  primary_email: string;
  // ... other properties
  picture_id: PictureId;
  // ... other properties
  label: number;
  org_name: string;
  owner_name: string;
  cc_email: string;
}

interface User {
  id: number;
  name: string;
  email: string;
  has_pic: number;
  pic_hash: string;
  active_flag: boolean;
}

interface OrgId {
  name: string;
  people_count: number;
  owner_id: number;
  address: string;
  active_flag: boolean;
  cc_email: string;
  value: number;
}

//OUTPUT
interface Phone {
  value: string;
  primary: boolean;
  label: string;
}

//OUTPUT
interface Email {
  value: string;
  primary: boolean;
  label: string;
}

//OUTPUT
interface PictureId {
  item_type: string;
  item_id: number;
  active_flag: boolean;
  add_time: string;
  update_time: string;
  added_by_user_id: number;
  pictures: Record<string, string>;
  value: number;
}

//INPUT
interface EmailObject {
  value: string;
  primary?: boolean;
  label?: string;
}

//INPUT
type PhoneObject = EmailObject;

//INPUT
type MarketingStatus =
  | 'no_consent'
  | 'unsubscribed'
  | 'subscribed'
  | 'archived';

//INPUT
type VisibleTo = 1 | 3 | 5 | 7;
