export interface PipedriveUser {
  id: number;
  name: string;
  default_currency: string;
  locale: string;
  lang: number;
  email: string;
  phone: string;
  activated: boolean;
  last_login: string;
  created: string;
  modified: string;
  has_created_company: boolean;
  access: Access[];
  active_flag: boolean;
  timezone_name: string;
  timezone_offset: string;
  role_id: number;
  icon_url: string | null;
  is_you: boolean;
  [key: string]: any;
}

export type PipedriveUserInput = Partial<PipedriveUser>;
export type PipedriveUserOutput = PipedriveUserInput;

type Access = {
  app: string;
  admin: boolean;
  permission_set_id: string;
};
