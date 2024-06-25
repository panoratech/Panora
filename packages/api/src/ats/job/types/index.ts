import { DesunifyReturnType } from '@@core/utils/types/desunify.input';
import { UnifiedJobInput, UnifiedJobOutput } from './model.unified';
import { OriginalJobOutput } from '@@core/utils/types/original/original.ats';
import { ApiResponse } from '@@core/utils/types';

export interface IJobService {
  addJob(
    jobData: DesunifyReturnType,
    linkedUserId: string,
  ): Promise<ApiResponse<OriginalJobOutput>>;

  syncJobs(
    linkedUserId: string,
    custom_properties?: string[],
  ): Promise<ApiResponse<OriginalJobOutput[]>>;
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
