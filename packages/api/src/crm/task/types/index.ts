import { DesunifyReturnType } from '@@core/utils/types/desunify.input';
import { UnifiedTaskInput, UnifiedTaskOutput } from './model.unified';
import { OriginalTaskOutput } from '@@core/utils/types/original/original.crm';
import { ApiResponse } from '@@core/utils/types';

export interface ITaskService {
  addTask(
    taskData: DesunifyReturnType,
    linkedUserId: string,
  ): Promise<ApiResponse<OriginalTaskOutput>>;

  syncTasks(
    linkedUserId: string,
    custom_properties?: string[],
  ): Promise<ApiResponse<OriginalTaskOutput[]>>;
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
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): UnifiedTaskOutput | UnifiedTaskOutput[];
}
