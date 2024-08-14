export type GustoEmployeeOutput = {
  uuid: string; // The UUID of the employee in Gusto.
  first_name: string; // The first name of the employee.
  middle_initial: string | null; // The middle initial of the employee.
  last_name: string; // The last name of the employee.
  email: string | null; // The personal email address of the employee.
  company_uuid: string; // The UUID of the company the employee is employed by.
  manager_uuid: string; // The UUID of the employee's manager.
  version: string; // The current version of the employee.
  department: string | null; // The employee's department in the company.
  terminated: boolean; // Whether the employee is terminated.
  two_percent_shareholder: boolean; // Whether the employee is a two percent shareholder of the company.
  onboarded: boolean; // Whether the employee has completed onboarding.
  onboarding_status:
    | 'onboarding_completed'
    | 'admin_onboarding_incomplete'
    | 'self_onboarding_pending_invite'
    | 'self_onboarding_invited'
    | 'self_onboarding_invited_started'
    | 'self_onboarding_invited_overdue'
    | 'self_onboarding_completed_by_employee'
    | 'self_onboarding_awaiting_admin_review'; // The current onboarding status of the employee.
  jobs: Job[]; // The jobs held by the employee.
  terminations: Termination[]; // The terminations of the employee.
  garnishments: Garnishment[]; // The garnishments of the employee.
  custom_fields?: CustomField[]; // Custom fields for the employee.
  date_of_birth: string | null; // The date of birth of the employee.
  has_ssn: boolean; // Indicates whether the employee has an SSN in Gusto.
  ssn: string; // Deprecated. This field always returns an empty string.
  phone: string; // The phone number of the employee.
  preferred_first_name: string; // The preferred first name of the employee.
  payment_method: 'Direct Deposit' | 'Check' | null; // The employee's payment method.
  work_email: string | null; // The work email address of the employee.
  current_employment_status:
    | 'full_time'
    | 'part_time_under_twenty_hours'
    | 'part_time_twenty_plus_hours'
    | 'variable'
    | 'seasonal'
    | null; // The current employment status of the employee.
};

type Job = {
  uuid: string; // The UUID of the job.
  version: string; // The current version of the job.
  employee_uuid: string; // The UUID of the employee to which the job belongs.
  hire_date: string; // The date when the employee was hired or rehired for the job.
  title: string | null; // The title for the job.
  primary: boolean; // Whether this is the employee's primary job.
  rate: string; // The current compensation rate of the job.
  payment_unit: string; // The payment unit of the current compensation for the job.
  current_compensation_uuid: string; // The UUID of the current compensation of the job.
  two_percent_shareholder: boolean; // Whether the employee owns at least 2% of the company.
  state_wc_covered: boolean; // Whether this job is eligible for workers' compensation coverage in the state of Washington (WA).
  state_wc_class_code: string; // The risk class code for workers' compensation in Washington state.
  compensations: Compensation[]; // The compensations associated with the job.
};

type Compensation = {
  uuid: string; // The UUID of the compensation in Gusto.
  version: string; // The current version of the compensation.
  job_uuid: string; // The UUID of the job to which the compensation belongs.
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
};

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

type Termination = {
  uuid: string; // The UUID of the termination object.
  version: string; // The current version of the termination.
  employee_uuid: string; // The UUID of the employee to which this termination is attached.
  active: boolean; // Whether the employee's termination has gone into effect.
  cancelable: boolean; // Whether the employee's termination is cancelable.
  effective_date: string; // The employee's last day of work.
  run_termination_payroll: boolean; // Whether the employee should receive their final wages via an off-cycle payroll.
};

type Garnishment = {
  uuid: string; // The UUID of the garnishment in Gusto.
  version: string; // The current version of the garnishment.
  employee_uuid: string; // The UUID of the employee to which this garnishment belongs.
  active: boolean; // Whether or not this garnishment is currently active.
  amount: string; // The amount of the garnishment.
  description: string; // The description of the garnishment.
  court_ordered: boolean; // Whether the garnishment is court ordered.
  times: number | null; // The number of times to apply the garnishment.
  recurring: boolean; // Whether the garnishment should recur indefinitely.
  annual_maximum: string | null; // The maximum deduction per annum.
  pay_period_maximum: string | null; // The maximum deduction per pay period.
  deduct_as_percentage: boolean; // Whether the amount should be treated as a percentage to be deducted per pay period.
};

type CustomField = {
  id: string; // The ID of the custom field.
  company_custom_field_id: string; // The ID of the company custom field.
  name: string; // The name of the custom field.
  type: 'text' | 'currency' | 'number' | 'date' | 'radio'; // Input type for the custom field.
  description: string; // The description of the custom field.
  value: string; // The value of the custom field.
  selection_options: string[] | null; // An array of options for fields of type radio.
};
