export type GustoEmployerbenefitOutput = Partial<{
  uuid: string;
  version: string;
  company_uuid: string;
  benefit_type: number;
  active: boolean;
  description: string;
  deletable: boolean;
  supports_percentage_amounts: boolean;
  responsible_for_employer_taxes: boolean;
  responsible_for_employee_w2: boolean;
  category: string;
  name: string;
}>;

export type GustoCategory =
  | 'Health'
  | 'Savings and Retirement'
  | 'Transportation'
  | 'Other';
