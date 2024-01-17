import { DesunifyReturnType } from '@@core/utils/types/desunify.input';
import { UnifiedEngagementInput, UnifiedEngagementOutput } from './model.unified';
import { OriginalEngagementOutput } from '@@core/utils/types/original/original.crm';
import { ApiResponse } from '@@core/utils/types';

export interface IEngagementService {
  addEngagement(
    engagementData: DesunifyReturnType,
    linkedUserId: string,
  ): Promise<ApiResponse<OriginalEngagementOutput>>;

  syncEngagements(
    linkedUserId: string,
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
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): UnifiedEngagementOutput | UnifiedEngagementOutput[];
}
