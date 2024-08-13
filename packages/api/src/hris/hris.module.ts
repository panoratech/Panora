import { Module } from '@nestjs/common';
import { BankInfoModule } from './bankinfo/bankinfo.module';
import { BenefitModule } from './benefit/benefit.module';
import { CompanyModule } from './company/company.module';
import { DependentModule } from './dependent/dependent.module';
import { EmployeePayrollRunModule } from './employeepayrollrun/employeepayrollrun.module';
import { EmployeeModule } from './employee/employee.module';
import { EmployerBenefitModule } from './employerbenefit/employerbenefit.module';
import { EmploymentModule } from './employment/employment.module';
import { GroupModule } from './group/group.module';
import { LocationModule } from './location/location.module';
import { PayGroupModule } from './paygroup/paygroup.module';
import { PayrollRunModule } from './payrollrun/payrollrun.module';
import { TimeoffModule } from './timeoff/timeoff.module';
import { TimeoffBalanceModule } from './timeoffbalance/timeoffbalance.module';
import { TimesheetentryModule } from './timesheetentry/timesheetentry.module';

@Module({
  exports: [
    BankInfoModule,
    BenefitModule,
    CompanyModule,
    DependentModule,
    EmployeePayrollRunModule,
    EmployeeModule,
    EmployerBenefitModule,
    EmploymentModule,
    GroupModule,
    LocationModule,
    PayGroupModule,
    PayrollRunModule,
    TimeoffModule,
    TimeoffBalanceModule,
    TimesheetentryModule,
  ],
  imports: [
    BankInfoModule,
    BenefitModule,
    CompanyModule,
    DependentModule,
    EmployeePayrollRunModule,
    EmployeeModule,
    EmployerBenefitModule,
    EmploymentModule,
    GroupModule,
    LocationModule,
    PayGroupModule,
    PayrollRunModule,
    TimeoffModule,
    TimeoffBalanceModule,
    TimesheetentryModule,
  ],
})
export class HrisModule {}
