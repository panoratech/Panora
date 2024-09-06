/* INPUT */

import { GustoBenefitOutput } from '@hris/benefit/services/gusto/types';
import { DeelCompanyOutput } from '@hris/company/services/deel/types';
import { GustoCompanyOutput } from '@hris/company/services/gusto/types';
import { DeelEmployeeOutput } from '@hris/employee/services/deel/types';
import { GustoEmployeeOutput } from '@hris/employee/services/gusto/types';
import { SageEmployeeOutput } from '@hris/employee/services/sage/types';
import { GustoEmployerbenefitOutput } from '@hris/employerbenefit/services/gusto/types';
import { DeelEmploymentOutput } from '@hris/employment/services/deel/types';
import { GustoEmploymentOutput } from '@hris/employment/services/gusto/types';
import { DeelGroupOutput } from '@hris/group/services/deel/types';
import { GustoGroupOutput } from '@hris/group/services/gusto/types';
import { SageGroupOutput } from '@hris/group/services/sage/types';
import { DeelLocationOutput } from '@hris/location/services/deel/types';
import { GustoLocationOutput } from '@hris/location/services/gusto/types';
import { SageTimeoffOutput } from '@hris/timeoff/services/sage/types';
import { SageTimeoffbalanceOutput } from '@hris/timeoffbalance/services/sage/types';

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
export type OriginalCompanyOutput = GustoCompanyOutput | DeelCompanyOutput;

/* dependent */
export type OriginalDependentOutput = any;

/* employee */
export type OriginalEmployeeOutput =
  | GustoEmployeeOutput
  | SageEmployeeOutput
  | DeelEmployeeOutput;

/* employeepayrollrun */
export type OriginalEmployeePayrollRunOutput = any;

/* employerbenefit */
export type OriginalEmployerBenefitOutput = GustoEmployerbenefitOutput;

/* employment */
export type OriginalEmploymentOutput =
  | GustoEmploymentOutput
  | DeelEmploymentOutput;

/* group */
export type OriginalGroupOutput =
  | GustoGroupOutput
  | DeelGroupOutput
  | SageGroupOutput;

/* location */
export type OriginalLocationOutput = GustoLocationOutput | DeelLocationOutput;

/* paygroup */
export type OriginalPayGroupOutput = any;

/* payrollrun */
export type OriginalPayrollRunOutput = any;

/* timeoff */
export type OriginalTimeoffOutput = SageTimeoffOutput;

/* timeoffbalance */
export type OriginalTimeoffBalanceOutput = SageTimeoffbalanceOutput;

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
