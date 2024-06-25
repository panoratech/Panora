import { DesunifyReturnType } from '@@core/utils/types/desunify.input';
import {
  UnifiedEmployeePayrollRunInput,
  UnifiedEmployeePayrollRunOutput,
} from './model.unified';
import { OriginalEmployeePayrollRunOutput } from '@@core/utils/types/original/original.hris';
import { ApiResponse } from '@@core/utils/types';

export interface IEmployeePayrollRunService {
  addEmployeePayrollRun(
    employeepayrollrunData: DesunifyReturnType,
    linkedUserId: string,
  ): Promise<ApiResponse<OriginalEmployeePayrollRunOutput>>;

  syncEmployeePayrollRuns(
    linkedUserId: string,
    custom_properties?: string[],
  ): Promise<ApiResponse<OriginalEmployeePayrollRunOutput[]>>;
}

export interface IEmployeePayrollRunMapper {
  desunify(
    source: UnifiedEmployeePayrollRunInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): DesunifyReturnType;

  unify(
    source:
      | OriginalEmployeePayrollRunOutput
      | OriginalEmployeePayrollRunOutput[],
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<
    UnifiedEmployeePayrollRunOutput | UnifiedEmployeePayrollRunOutput[]
  >;
}
