import { DesunifyReturnType } from '@@core/utils/types/desunify.input';
import { UnifiedTaskInput, UnifiedTaskOutput } from './model.unified';
import { OriginalTaskOutput } from '@@core/utils/types/original/original.crm';
import { ApiResponse } from '@@core/utils/types';
import { IBaseObjectService, SyncParam } from '@@core/utils/types/interface';

export interface ITaskService extends IBaseObjectService {
  addTask?(
    taskData: DesunifyReturnType,
    linkedUserId: string,
  ): Promise<ApiResponse<OriginalTaskOutput>>;

  sync(data: SyncParam): Promise<ApiResponse<OriginalTaskOutput[]>>;
}

export interface ITaskMapper {
  desunify(
    source: UnifiedTaskInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): DesunifyReturnType;

  unify(
    source: OriginalTaskOutput | OriginalTaskOutput[],
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedTaskOutput | UnifiedTaskOutput[]>;
}
