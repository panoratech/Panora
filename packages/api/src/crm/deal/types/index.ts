import { DesunifyReturnType } from '@@core/utils/types/desunify.input';
import { UnifiedCrmDealInput, UnifiedCrmDealOutput } from './model.unified';
import { OriginalDealOutput } from '@@core/utils/types/original/original.crm';
import { ApiResponse } from '@@core/utils/types';
import { IBaseObjectService, SyncParam } from '@@core/utils/types/interface';

export interface IDealService extends IBaseObjectService {
  addDeal(
    dealData: DesunifyReturnType,
    linkedUserId: string,
  ): Promise<ApiResponse<OriginalDealOutput>>;

  sync(data: SyncParam): Promise<ApiResponse<OriginalDealOutput[]>>;
}

export interface IDealMapper {
  desunify(
    source: UnifiedCrmDealInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): DesunifyReturnType;

  unify(
    source: OriginalDealOutput | OriginalDealOutput[],
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedCrmDealOutput | UnifiedCrmDealOutput[]>;
}
