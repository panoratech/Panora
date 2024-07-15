import { DesunifyReturnType } from '@@core/utils/types/desunify.input';
import { UnifiedEmployeeInput, UnifiedEmployeeOutput } from './model.unified';
import { OriginalEmployeeOutput } from '@@core/utils/types/original/original.hris';
import { ApiResponse } from '@@core/utils/types';

export interface IEmployeeService {
  addEmployee(
    employeeData: DesunifyReturnType,
    linkedUserId: string,
  ): Promise<ApiResponse<OriginalEmployeeOutput>>;

  syncEmployees(
    linkedUserId: string,
    custom_properties?: string[],
  ): Promise<ApiResponse<OriginalEmployeeOutput[]>>;
}

export interface IEmployeeMapper {
  desunify(
    source: UnifiedEmployeeInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): DesunifyReturnType;

  unify(
    source: OriginalEmployeeOutput | OriginalEmployeeOutput[],
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedEmployeeOutput | UnifiedEmployeeOutput[]>;
}
