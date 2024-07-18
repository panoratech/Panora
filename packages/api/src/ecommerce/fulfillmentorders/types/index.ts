import { DesunifyReturnType } from '@@core/utils/types/desunify.input';
import {
  UnifiedDepartmentInput,
  UnifiedDepartmentOutput,
} from './model.unified';
import { OriginalDepartmentOutput } from '@@core/utils/types/original/original.ats';
import { ApiResponse } from '@@core/utils/types';
import { IBaseObjectService, SyncParam } from '@@core/utils/types/interface';

export interface IDepartmentService extends IBaseObjectService {
  addDepartment(
    departmentData: DesunifyReturnType,
    linkedUserId: string,
  ): Promise<ApiResponse<OriginalDepartmentOutput>>;

  sync(data: SyncParam): Promise<ApiResponse<OriginalDepartmentOutput[]>>;
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
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedDepartmentOutput | UnifiedDepartmentOutput[]>;
}
