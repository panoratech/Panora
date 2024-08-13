export type GustoEmploymentOutput = Partial<{
  uuid: string; // The UUID of the compensation in Gusto.
  version: string; // The current version of the compensation.
  job_uuid: string; // The UUID of the job to which the compensation belongs.
  title: string;
  rate: string; // The dollar amount paid per payment unit.
  payment_unit: 'Hour' | 'Week' | 'Month' | 'Year' | 'Paycheck'; // The unit accompanying the compensation rate.
  flsa_status:
    | 'Exempt'
    | 'Salaried Nonexempt'
    | 'Nonexempt'
    | 'Owner'
    | 'Commission Only Exempt'
    | 'Commission Only Nonexempt'; // The FLSA status for this compensation.
  effective_date: string; // The effective date for this compensation.
  adjust_for_minimum_wage: boolean; // Indicates if the compensation could be adjusted to minimum wage during payroll calculation.
  eligible_paid_time_off: EligiblePaidTimeOff[]; // The available types of paid time off for the compensation.
}>;

type EligiblePaidTimeOff = {
  name: string; // The name of the paid time off type.
  policy_name: string; // The name of the time off policy.
  policy_uuid: string; // The UUID of the time off policy.
  accrual_unit: string; // The unit the PTO type is accrued in.
  accrual_rate: string; // The number of accrual units accrued per accrual period.
  accrual_method: string; // The accrual method of the time off policy.
  accrual_period: string; // The frequency at which the PTO type is accrued.
  accrual_balance: string; // The number of accrual units accrued.
  maximum_accrual_balance: string | null; // The maximum number of accrual units allowed.
  paid_at_termination: boolean; // Whether the accrual balance is paid to the employee upon termination.
};
