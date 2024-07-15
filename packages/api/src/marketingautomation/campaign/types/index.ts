import { DesunifyReturnType } from '@@core/utils/types/desunify.input';
import { UnifiedCampaignInput, UnifiedCampaignOutput } from './model.unified';
import { OriginalCampaignOutput } from '@@core/utils/types/original/original.marketing-automation';
import { ApiResponse } from '@@core/utils/types';

export interface ICampaignService {
  addCampaign(
    campaignData: DesunifyReturnType,
    linkedUserId: string,
  ): Promise<ApiResponse<OriginalCampaignOutput>>;

  syncCampaigns(
    linkedUserId: string,
    custom_properties?: string[],
  ): Promise<ApiResponse<OriginalCampaignOutput[]>>;
}

export interface ICampaignMapper {
  desunify(
    source: UnifiedCampaignInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): DesunifyReturnType;

  unify(
    source: OriginalCampaignOutput | OriginalCampaignOutput[],
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedCampaignOutput | UnifiedCampaignOutput[]>;
}
