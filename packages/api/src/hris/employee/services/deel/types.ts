export type DeelEmployeeOutput = Partial<{
  id: string;
  created_at: string; // Date-time in string format
  first_name: string;
  last_name: string;
  full_name: string;
  addresses: DeelAddress[];
  emails: DeelEmail[];
  birth_date: string;
  start_date: string; // Date in string format
  nationalities: string[];
  client_legal_entity: DeelClientLegalEntity;
  state: string;
  seniority: string;
  completion_date: string | null;
  direct_manager: DeelDirectManager | null;
  direct_reports: DeelDirectManager[] | null;
  direct_reports_count: number;
  employments: DeelEmployment[];
  hiring_status: string;
  new_hiring_status: string;
  hiring_type: string;
  job_title: string;
  country: string;
  timezone: string;
  department: DeelDepartment;
  work_location: string;
  updated_at: string | null; // Date-time in string format
}>;

export interface DeelAddress {
  streetAddress: string;
  locality: string;
  region: string;
  postalCode: string;
  country: string;
}

export interface DeelEmail {
  type: string;
  value: string;
}

export interface DeelClientLegalEntity {
  id: string;
  name: string;
}

export interface DeelDirectManager {
  id: string;
  last_name: string;
  first_name: string;
  work_email: string;
}

export interface DeelTeam {
  id: string;
  name: string;
}

export interface DeelPayment {
  rate: number;
  scale: string;
  currency: string;
  contract_name: string;
}
export interface DeelDepartment {
  id: string;
  name: string;
  parent: string;
}

export interface DeelEmployment {
  id: string;
  name: string;
  team: DeelTeam;
  email: string;
  state: string;
  country: string;
  payment: DeelPayment;
  is_ended: boolean;
  timezone: string;
  job_title: string;
  seniority: string;
  start_date: string; // Date in string format
  work_email: string;
  hiring_type: string;
  hiring_status: string;
  completion_date: string;
  contract_status: string;
  voluntarily_left: string;
  contract_coverage: string[];
  new_hiring_status: string;
  client_legal_entity: DeelClientLegalEntity;
  has_eor_termination: string;
  contract_is_archived: boolean;
  contract_has_contractor: boolean;
  is_user_contract_deleted: boolean;
  hris_direct_employee_invitation: string;
}
