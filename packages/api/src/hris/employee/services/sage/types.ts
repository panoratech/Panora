export type SageEmployeeOutput = Partial<{
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  picture_url: string;
  employment_start_date: string;
  date_of_birth: string;
  team: string;
  team_id: number;
  position: string;
  position_id: number;
  reports_to_employee_id: number;
  work_phone: string;
  home_phone: string;
  mobile_phone: string;
  gender: string;
  street_first: string;
  street_second: string;
  city: string;
  post_code: number;
  country: string;
  employee_number: string;
  employment_status: string;
  nationality: string;
  marital_status: string;
  personal_identification_number: string;
  tax_number: string;
  irregular_contract_worker: boolean;
  team_history: SageTeamHistory[];
  employment_status_history: SageEmploymentStatusHistory[];
  position_history: SagePositionHistory[];
}>;

export interface SageTeamHistory {
  team_id: number;
  start_date: string;
  end_date: string;
  team_name: string;
}

export interface SageEmploymentStatusHistory {
  employment_status_id: number;
  start_date: string;
  end_date: string;
  employment_statu_name: string; // Note: This seems to be a typo in the original data
}

export interface SagePositionHistory {
  position_id: number;
  start_date: string;
  end_date: string;
  position_name: string;
  position_code: string;
}
