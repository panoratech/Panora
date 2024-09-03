export type DeelEmploymentOutput = Partial<{
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
}>;

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

export interface DeelClientLegalEntity {
  id: string;
  name: string;
}
