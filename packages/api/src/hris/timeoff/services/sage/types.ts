export interface SageTimeoffReplacement {
  id: number;
  full_name: string;
}

export interface SageTimeoffField {
  title: string;
  answer: string;
}

export type SageTimeoffOutput = Partial<{
  id: number;
  status: string;
  status_code: string;
  policy_id: number;
  employee_id: number;
  replacement: SageTimeoffReplacement;
  details: string;
  is_multi_date: boolean;
  is_single_day: boolean;
  is_part_of_day: boolean;
  first_part_of_day: boolean;
  second_part_of_day: boolean;
  start_date: string;
  end_date: string;
  request_date: string;
  approval_date: string | null;
  hours: number;
  fields: SageTimeoffField[];
}>;
