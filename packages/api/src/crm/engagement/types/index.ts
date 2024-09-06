import { DesunifyReturnType } from '@@core/utils/types/desunify.input';
import {
  UnifiedCrmEngagementInput,
  UnifiedCrmEngagementOutput,
} from './model.unified';
import { OriginalEngagementOutput } from '@@core/utils/types/original/original.crm';
import { ApiResponse } from '@@core/utils/types';
import { IBaseObjectService, SyncParam } from '@@core/utils/types/interface';

export interface IEngagementService extends IBaseObjectService {
  addEngagement?(
    engagementData: DesunifyReturnType,
    linkedUserId: string,
    engagement_type: string,
  ): Promise<ApiResponse<OriginalEngagementOutput>>;

  sync(data: SyncParam): Promise<ApiResponse<OriginalEngagementOutput[]>>;
}

export interface IEngagementMapper {
  desunify(
    source: UnifiedCrmEngagementInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): DesunifyReturnType;

  unify(
    source: OriginalEngagementOutput | OriginalEngagementOutput[],
    engagement_type: string,
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedCrmEngagementOutput | UnifiedCrmEngagementOutput[]>;
}
