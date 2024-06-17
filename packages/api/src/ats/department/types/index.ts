import { DesunifyReturnType } from '@@core/utils/types/desunify.input';
import {
  UnifiedDepartmentInput,
  UnifiedDepartmentOutput,
} from './model.unified';
import { OriginalDepartmentOutput } from '@@core/utils/types/original/original.ats';
import { ApiResponse } from '@@core/utils/types';

export interface IDepartmentService {
  addDepartment(
    departmentData: DesunifyReturnType,
    linkedUserId: string,
  ): Promise<ApiResponse<OriginalDepartmentOutput>>;

  syncDepartments(
    linkedUserId: string,
    custom_properties?: string[],
  ): Promise<ApiResponse<OriginalDepartmentOutput[]>>;
}

export interface IDepartmentMapper {
  desunify(
    source: UnifiedDepartmentInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): DesunifyReturnType;

  unify(
    source: OriginalDepartmentOutput | OriginalDepartmentOutput[],
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): UnifiedDepartmentOutput | UnifiedDepartmentOutput[];
}
