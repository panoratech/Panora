import { DesunifyReturnType } from '@@core/utils/types/desunify.input';
import {
  UnifiedEngagementInput,
  UnifiedEngagementOutput,
} from './model.unified';
import { OriginalEngagementOutput } from '@@core/utils/types/original/original.crm';
import { ApiResponse } from '@@core/utils/types';

export interface IEngagementService {
  addEngagement(
    engagementData: DesunifyReturnType,
    linkedUserId: string,
    engagement_type: string,
  ): Promise<ApiResponse<OriginalEngagementOutput>>;

  syncEngagements(
    linkedUserId: string,
    engagement_type: string,
    custom_properties?: string[],
  ): Promise<ApiResponse<OriginalEngagementOutput[]>>;
}

export interface IEngagementMapper {
  desunify(
    source: UnifiedEngagementInput,
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
  ): Promise<UnifiedEngagementOutput | UnifiedEngagementOutput[]>;
}
