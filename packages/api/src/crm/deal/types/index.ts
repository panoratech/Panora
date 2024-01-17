import { DesunifyReturnType } from '@@core/utils/types/desunify.input';
import { UnifiedDealInput, UnifiedDealOutput } from './model.unified';
import { OriginalDealOutput } from '@@core/utils/types/original/original.crm';
import { ApiResponse } from '@@core/utils/types';

export interface IDealService {
  addDeal(
    dealData: DesunifyReturnType,
    linkedUserId: string,
  ): Promise<ApiResponse<OriginalDealOutput>>;

  syncDeals(
    linkedUserId: string,
    custom_properties?: string[],
  ): Promise<ApiResponse<OriginalDealOutput[]>>;
}

export interface IDealMapper {
  desunify(
    source: UnifiedDealInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): DesunifyReturnType;

  unify(
    source: OriginalDealOutput | OriginalDealOutput[],
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedDealOutput | UnifiedDealOutput[]>;
}
