interface ZohoUser {
  country: string | null;
  name_format__s: string;
  language: string;
  microsoft: boolean;
  $shift_effective_from: string | null;
  Currency: string;
  id: string;
  state: string | null;
  fax: string | null;
  country_locale: string;
  sandboxDeveloper: boolean;
  zip: string | null;
  decimal_separator: string;
  created_time: string;
  time_format: string;
  offset: number;
  profile: Profile;
  created_by: CreatedBy;
  zuid: string | null;
  full_name: string;
  phone: string | null;
  dob: string | null;
  sort_order_preference__s: string | null;
  status: string;
  role: Role;
  customize_info: CustomizeInfo;
  city: string | null;
  signature: string | null;
  locale: string;
  personal_account: boolean;
  Isonline: boolean;
  default_tab_group: string;
  Modified_By: ModifiedBy;
  street: string | null;
  $current_shift: string | null;
  alias: string | null;
  theme: Theme;
  first_name: string | null;
  email: string;
  status_reason__s: string | null;
  website: string | null;
  Modified_Time: string;
  $next_shift: string | null;
  mobile: string | null;
  last_name: string;
  time_zone: string;
  number_separator: string;
  confirm: boolean;
  date_format: string;
  category: string;
  $in_merge: boolean | null;
  Tag: string[];
  Fax: string | null;
  $approval_state: string;
}

interface Profile {
  name: string;
  id: string;
}

interface CreatedBy {
  name: string;
  id: string;
}

interface Role {
  name: string;
  id: string;
}

interface CustomizeInfo {
  notes_desc: boolean;
  show_right_panel: boolean | null;
  bc_view: boolean | null;
  show_home: boolean;
  show_detail_view: boolean;
  unpin_recent_item: boolean | null;
}

interface ModifiedBy {
  name: string;
  id: string;
}

interface Theme {
  normal_tab: TabStyle;
  selected_tab: TabStyle;
  new_background: string | null;
  background: string;
  screen: string;
  type: string;
}

interface TabStyle {
  font_color: string;
  background: string;
}

export type ZohoUserInput = Partial<ZohoUser>;
export type ZohoUserOutput = ZohoUserInput;
