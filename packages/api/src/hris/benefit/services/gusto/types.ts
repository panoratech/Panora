export type GustoBenefitOutput = Partial<{
  version: string;
  employee_uuid: string;
  company_benefit_uuid: string;
  active: boolean;
  uuid: string;
  employee_deduction: string;
  company_contribution: string;
  employee_deduction_annual_maximum: string;
  company_contribution_annual_maximum: string;
  limit_option: string;
  deduct_as_percentage: boolean;
  contribute_as_percentage: boolean;
  catch_up: boolean;
  coverage_amount: string;
  contribution: {
    type: 'amount' | 'percentage' | 'tiered';
    value:
      | string
      | number
      | Array<{ threshold: number; amount: string | number }>;
  };
  deduction_reduces_taxable_income:
    | 'unset'
    | 'reduces_taxable_income'
    | 'does_not_reduce_taxable_income';
  coverage_salary_multiplier: string;
}>;
