import { DesunifyReturnType } from '@@core/utils/types/desunify.input';
import { UnifiedEcommerceCustomerInput, UnifiedEcommerceCustomerOutput } from './model.unified';
import { OriginalCustomerOutput } from '@@core/utils/types/original/original.ecommerce';
import { ApiResponse } from '@@core/utils/types';
import { IBaseObjectService, SyncParam } from '@@core/utils/types/interface';

export interface ICustomerService extends IBaseObjectService {
  sync(data: SyncParam): Promise<ApiResponse<OriginalCustomerOutput[]>>;
}

export interface ICustomerMapper {
  desunify(
    source: UnifiedEcommerceCustomerInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): DesunifyReturnType;

  unify(
    source: OriginalCustomerOutput | OriginalCustomerOutput[],
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedEcommerceCustomerOutput | UnifiedEcommerceCustomerOutput[]>;
}
