import { DesunifyReturnType } from '@@core/utils/types/desunify.input';
import { UnifiedInterviewInput, UnifiedInterviewOutput } from './model.unified';
import { OriginalInterviewOutput } from '@@core/utils/types/original/original.ats';
import { ApiResponse } from '@@core/utils/types';
import { IBaseObjectService, SyncParam } from '@@core/utils/types/interface';

export interface IInterviewService extends IBaseObjectService {
  addInterview?(
    interviewData: DesunifyReturnType,
    linkedUserId: string,
  ): Promise<ApiResponse<OriginalInterviewOutput>>;

  sync(data: SyncParam): Promise<ApiResponse<OriginalInterviewOutput[]>>;
}

export interface IInterviewMapper {
  desunify(
    source: UnifiedInterviewInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): DesunifyReturnType;

  unify(
    source: OriginalInterviewOutput | OriginalInterviewOutput[],
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedInterviewOutput | UnifiedInterviewOutput[]>;
}
