import { DesunifyReturnType } from '@@core/utils/types/desunify.input';
import { UnifiedOpportunityInput, UnifiedOpportunityOutput } from './model.unified';
import { OriginalOpportunityOutput } from '@@core/utils/types/original/original.crm';
import { ApiResponse } from '@@core/utils/types';
import { IBaseObjectService, SyncParam } from '@@core/utils/types/interface';

export interface IOpportunityService extends IBaseObjectService {
  addOpportunity(
    opportunityData: DesunifyReturnType,
    linkedUserId: string,
  ): Promise<ApiResponse<OriginalOpportunityOutput>>;

  sync(data: SyncParam): Promise<ApiResponse<OriginalOpportunityOutput[]>>;
}

export interface IOpportunityMapper {
  desunify(
    source: UnifiedOpportunityInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): DesunifyReturnType;

  unify(
    source: OriginalOpportunityOutput | OriginalOpportunityOutput[],
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedOpportunityOutput | UnifiedOpportunityOutput[]>;
}
