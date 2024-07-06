import { DesunifyReturnType } from '@@core/utils/types/desunify.input';
import { UnifiedJobInput, UnifiedJobOutput } from './model.unified';
import { OriginalJobOutput } from '@@core/utils/types/original/original.ats';
import { ApiResponse } from '@@core/utils/types';
import { IBaseObjectService, SyncParam } from '@@core/utils/types/interface';

export interface IJobService extends IBaseObjectService {
  addJob(
    jobData: DesunifyReturnType,
    linkedUserId: string,
  ): Promise<ApiResponse<OriginalJobOutput>>;

  sync(data: SyncParam): Promise<ApiResponse<OriginalJobOutput[]>>;
}

export interface IJobMapper {
  desunify(
    source: UnifiedJobInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): DesunifyReturnType;

  unify(
    source: OriginalJobOutput | OriginalJobOutput[],
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedJobOutput | UnifiedJobOutput[]>;
}
