import { ICompanyService } from '@crm/company/types';
import { IBankInfoService } from '@hris/bankinfo/types';
import {
  UnifiedHrisBankinfoInput,
  UnifiedHrisBankinfoOutput,
} from '@hris/bankinfo/types/model.unified';
import { IBenefitService } from '@hris/benefit/types';
import {
  UnifiedHrisBenefitInput,
  UnifiedHrisBenefitOutput,
} from '@hris/benefit/types/model.unified';
import {
  UnifiedHrisCompanyInput,
  UnifiedHrisCompanyOutput,
} from '@hris/company/types/model.unified';
import { IDependentService } from '@hris/dependent/types';
import {
  UnifiedHrisDependentInput,
  UnifiedHrisDependentOutput,
} from '@hris/dependent/types/model.unified';
import { IEmployeeService } from '@hris/employee/types';
import {
  UnifiedHrisEmployeeInput,
  UnifiedHrisEmployeeOutput,
} from '@hris/employee/types/model.unified';
import { IEmployeePayrollRunService } from '@hris/employeepayrollrun/types';
import {
  UnifiedHrisEmployeepayrollrunInput,
  UnifiedHrisEmployeepayrollrunOutput,
} from '@hris/employeepayrollrun/types/model.unified';
import { IEmployerBenefitService } from '@hris/employerbenefit/types';
import {
  UnifiedHrisEmployerbenefitInput,
  UnifiedHrisEmployerbenefitOutput,
} from '@hris/employerbenefit/types/model.unified';
import { IEmploymentService } from '@hris/employment/types';
import {
  UnifiedHrisEmploymentInput,
  UnifiedHrisEmploymentOutput,
} from '@hris/employment/types/model.unified';
import {
  UnifiedHrisGroupInput,
  UnifiedHrisGroupOutput,
} from '@hris/group/types/model.unified';
import { ILocationService } from '@hris/location/types';
import {
  UnifiedHrisLocationInput,
  UnifiedHrisLocationOutput,
} from '@hris/location/types/model.unified';
import { IPayGroupService } from '@hris/paygroup/types';
import {
  UnifiedHrisPaygroupInput,
  UnifiedHrisPaygroupOutput,
} from '@hris/paygroup/types/model.unified';
import { IPayrollRunService } from '@hris/payrollrun/types';
import {
  UnifiedHrisPayrollrunInput,
  UnifiedHrisPayrollrunOutput,
} from '@hris/payrollrun/types/model.unified';
import { ITimeoffService } from '@hris/timeoff/types';
import {
  UnifiedHrisTimeoffInput,
  UnifiedHrisTimeoffOutput,
} from '@hris/timeoff/types/model.unified';
import { ITimeoffBalanceService } from '@hris/timeoffbalance/types';
import {
  UnifiedHrisTimeoffbalanceInput,
  UnifiedHrisTimeoffbalanceOutput,
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
  | UnifiedHrisBankinfoInput
  | UnifiedHrisBankinfoOutput
  | UnifiedHrisBenefitInput
  | UnifiedHrisBenefitOutput
  | UnifiedHrisCompanyInput
  | UnifiedHrisCompanyOutput
  | UnifiedHrisEmployeepayrollrunInput
  | UnifiedHrisEmployeepayrollrunOutput
  | UnifiedHrisEmployeeInput
  | UnifiedHrisEmployeeOutput
  | UnifiedHrisDependentInput
  | UnifiedHrisDependentOutput
  | UnifiedHrisTimeoffInput
  | UnifiedHrisTimeoffOutput
  | UnifiedHrisTimeoffbalanceInput
  | UnifiedHrisTimeoffbalanceOutput
  | UnifiedHrisPayrollrunInput
  | UnifiedHrisPayrollrunOutput
  | UnifiedHrisEmployerbenefitInput
  | UnifiedHrisEmployerbenefitOutput
  | UnifiedHrisEmploymentInput
  | UnifiedHrisEmploymentOutput
  | UnifiedHrisGroupInput
  | UnifiedHrisGroupOutput
  | UnifiedHrisLocationInput
  | UnifiedHrisLocationOutput
  | UnifiedHrisPaygroupInput
  | UnifiedHrisPaygroupOutput;

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
