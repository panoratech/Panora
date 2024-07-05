import { DesunifyReturnType } from '@@core/utils/types/desunify.input';
import { UnifiedActivityInput, UnifiedActivityOutput } from './model.unified';
import { OriginalActivityOutput } from '@@core/utils/types/original/original.ats';
import { ApiResponse } from '@@core/utils/types';

export interface IActivityService {
  addActivity(
    activityData: DesunifyReturnType,
    linkedUserId: string,
  ): Promise<ApiResponse<OriginalActivityOutput>>;

  syncActivities(
    linkedUserId: string,
    candidate_id?: string,
    custom_properties?: string[],
  ): Promise<ApiResponse<OriginalActivityOutput[]>>;
}

export interface IActivityMapper {
  desunify(
    source: UnifiedActivityInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): DesunifyReturnType;

  unify(
    source: OriginalActivityOutput | OriginalActivityOutput[],
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedActivityOutput | UnifiedActivityOutput[]>;
}
