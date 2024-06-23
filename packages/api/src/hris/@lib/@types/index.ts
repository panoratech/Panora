import { ICompanyService } from '@crm/company/types';
import {
  UnifiedCompanyInput,
  UnifiedCompanyOutput,
} from '@crm/company/types/model.unified';
import { IBankInfoService } from '@hris/bankinfo/types';
import {
  UnifiedBankInfoInput,
  UnifiedBankInfoOutput,
} from '@hris/bankinfo/types/model.unified';
import { IBenefitService } from '@hris/benefit/types';
import {
  UnifiedBenefitInput,
  UnifiedBenefitOutput,
} from '@hris/benefit/types/model.unified';
import { IDependentService } from '@hris/dependent/types';
import {
  UnifiedDependentInput,
  UnifiedDependentOutput,
} from '@hris/dependent/types/model.unified';
import { IEmployeeService } from '@hris/employee/types';
import {
  UnifiedEmployeeInput,
  UnifiedEmployeeOutput,
} from '@hris/employee/types/model.unified';
import { IEmployeePayrollRunService } from '@hris/employeepayrollrun/types';
import {
  UnifiedEmployeePayrollRunInput,
  UnifiedEmployeePayrollRunOutput,
} from '@hris/employeepayrollrun/types/model.unified';
import { IEmployerBenefitService } from '@hris/employerbenefit/types';
import {
  UnifiedEmployerBenefitInput,
  UnifiedEmployerBenefitOutput,
} from '@hris/employerbenefit/types/model.unified';
import { IEmploymentService } from '@hris/employment/types';
import {
  UnifiedEmploymentInput,
  UnifiedEmploymentOutput,
} from '@hris/employment/types/model.unified';
import {
  UnifiedGroupInput,
  UnifiedGroupOutput,
} from '@hris/group/types/model.unified';
import { ILocationService } from '@hris/location/types';
import {
  UnifiedLocationInput,
  UnifiedLocationOutput,
} from '@hris/location/types/model.unified';
import { IPayGroupService } from '@hris/paygroup/types';
import {
  UnifiedPayGroupInput,
  UnifiedPayGroupOutput,
} from '@hris/paygroup/types/model.unified';
import { IPayrollRunService } from '@hris/payrollrun/types';
import {
  UnifiedPayrollRunInput,
  UnifiedPayrollRunOutput,
} from '@hris/payrollrun/types/model.unified';
import { ITimeoffService } from '@hris/timeoff/types';
import {
  UnifiedTimeoffInput,
  UnifiedTimeoffOutput,
} from '@hris/timeoff/types/model.unified';
import { ITimeoffBalanceService } from '@hris/timeoffbalance/types';
import {
  UnifiedTimeoffBalanceInput,
  UnifiedTimeoffBalanceOutput,
} from '@hris/timeoffbalance/types/model.unified';

export enum HrisObject {
  bankinfo = 'bankinfo',
  benefit = 'benefit',
  company = 'company',
  dependent = 'dependent',
  employee = 'employee',
  employeepayrollrun = 'employeepayrollrun',
  employerbenefit = 'employerbenefit',
  employment = 'employment',
  group = 'group',
  location = 'location',
  paygroup = 'paygroup',
  payrollrun = 'payrollrun',
  timeoff = 'timeoff',
  timeoffbalance = 'timeoffbalance',
}

export type UnifiedHris =
  | UnifiedBankInfoInput
  | UnifiedBankInfoOutput
  | UnifiedBenefitInput
  | UnifiedBenefitOutput
  | UnifiedCompanyInput
  | UnifiedCompanyOutput
  | UnifiedEmployeePayrollRunInput
  | UnifiedEmployeePayrollRunOutput
  | UnifiedEmployeeInput
  | UnifiedEmployeeOutput
  | UnifiedDependentInput
  | UnifiedDependentOutput
  | UnifiedTimeoffInput
  | UnifiedTimeoffOutput
  | UnifiedTimeoffBalanceInput
  | UnifiedTimeoffBalanceOutput
  | UnifiedPayrollRunInput
  | UnifiedPayrollRunOutput
  | UnifiedEmployerBenefitInput
  | UnifiedEmployerBenefitOutput
  | UnifiedEmploymentInput
  | UnifiedEmploymentOutput
  | UnifiedGroupInput
  | UnifiedGroupOutput
  | UnifiedLocationInput
  | UnifiedLocationOutput
  | UnifiedPayGroupInput
  | UnifiedPayGroupOutput;

/*export const unificationMapping = {
  [HrisObject.bankinfo]: bankinfoUnificationMapping,
  [HrisObject.benefit]: benefitUnificationMapping,
  [HrisObject.company]: companyUnificationMapping,
  [HrisObject.dependent]: dependentUnificationMapping,
  [HrisObject.employee]: employeeUnificationMapping,
  [HrisObject.employeepayrollrun]: employeepayrollrunUnificationMapping,
  [HrisObject.employerbenefit]: employerbenefitUnificationMapping,
  [HrisObject.employment]: employmentUnificationMapping,
  [HrisObject.group]: groupUnificationMapping,
  [HrisObject.location]: locationUnificationMapping,
  [HrisObject.paygroup]: paygroupUnificationMapping,
  [HrisObject.payrollrun]: payrollrunUnificationMapping,
  [HrisObject.timeoff]: timeoffUnificationMapping,
  [HrisObject.timeoffbalance]: timeoffbalanceUnificationMapping,
};*/

export type IHrisService =
  | IBankInfoService
  | IBenefitService
  | ICompanyService
  | IDependentService
  | IEmployeeService
  | IEmployeePayrollRunService
  | IEmployerBenefitService
  | IEmploymentService
  | ITimeoffService
  | ITimeoffBalanceService
  | IPayrollRunService
  | IPayGroupService
  | ILocationService;
