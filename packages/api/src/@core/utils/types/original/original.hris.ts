/* INPUT */

import { GustoBenefitOutput } from '@hris/benefit/services/gusto/types';
import { GustoCompanyOutput } from '@hris/company/services/gusto/types';
import { GustoEmployeeOutput } from '@hris/employee/services/gusto/types';
import { GustoEmployerbenefitOutput } from '@hris/employerbenefit/services/gusto/types';
import { GustoEmploymentOutput } from '@hris/employment/services/gusto/types';
import { GustoGroupOutput } from '@hris/group/services/gusto/types';
import { GustoLocationOutput } from '@hris/location/services/gusto/types';

/* bankinfo */
export type OriginalBankInfoInput = any;

/* benefit */
export type OriginalBenefitInput = any;

/* company */
export type OriginalCompanyInput = any;

/* dependent */
export type OriginalDependentInput = any;

/* employee */
export type OriginalEmployeeInput = any;

/* employeepayrollrun */
export type OriginalEmployeePayrollRunInput = any;

/* employerbenefit */
export type OriginalEmployerBenefitInput = any;

/* employment */
export type OriginalEmploymentInput = any;

/* group */
export type OriginalGroupInput = any;

/* location */
export type OriginalLocationInput = any;

/* paygroup */
export type OriginalPayGroupInput = any;

/* payrollrun */
export type OriginalPayrollRunInput = any;

/* timeoff */
export type OriginalTimeoffInput = any;

/* timeoffbalance */
export type OriginalTimeoffBalanceInput = any;

/* timesheetentry */
export type OriginalTimesheetentryInput = any;

export type HrisObjectInput =
  | OriginalBankInfoInput
  | OriginalBenefitInput
  | OriginalCompanyInput
  | OriginalDependentInput
  | OriginalEmployeeInput
  | OriginalEmployeePayrollRunInput
  | OriginalEmployerBenefitInput
  | OriginalEmploymentInput
  | OriginalGroupInput
  | OriginalLocationInput
  | OriginalPayGroupInput
  | OriginalPayrollRunInput
  | OriginalTimeoffInput
  | OriginalTimeoffBalanceInput
  | OriginalTimesheetentryInput;

/* OUTPUT */

/* bankinfo */
export type OriginalBankInfoOutput = any;

/* benefit */
export type OriginalBenefitOutput = GustoBenefitOutput;

/* company */
export type OriginalCompanyOutput = GustoCompanyOutput;

/* dependent */
export type OriginalDependentOutput = any;

/* employee */
export type OriginalEmployeeOutput = GustoEmployeeOutput;

/* employeepayrollrun */
export type OriginalEmployeePayrollRunOutput = any;

/* employerbenefit */
export type OriginalEmployerBenefitOutput = GustoEmployerbenefitOutput;

/* employment */
export type OriginalEmploymentOutput = GustoEmploymentOutput;

/* group */
export type OriginalGroupOutput = GustoGroupOutput;

/* location */
export type OriginalLocationOutput = GustoLocationOutput;

/* paygroup */
export type OriginalPayGroupOutput = any;

/* payrollrun */
export type OriginalPayrollRunOutput = any;

/* timeoff */
export type OriginalTimeoffOutput = any;

/* timeoffbalance */
export type OriginalTimeoffBalanceOutput = any;

/* timesheetentry */
export type OriginalTimesheetentryOutput = any;

export type HrisObjectOutput =
  | OriginalBankInfoOutput
  | OriginalBenefitOutput
  | OriginalCompanyOutput
  | OriginalDependentOutput
  | OriginalEmployeeOutput
  | OriginalEmployeePayrollRunOutput
  | OriginalEmployerBenefitOutput
  | OriginalEmploymentOutput
  | OriginalGroupOutput
  | OriginalLocationOutput
  | OriginalPayGroupOutput
  | OriginalPayrollRunOutput
  | OriginalTimeoffOutput
  | OriginalTimeoffBalanceOutput
  | OriginalTimesheetentryOutput;
