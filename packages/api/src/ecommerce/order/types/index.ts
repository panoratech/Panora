import { DesunifyReturnType } from '@@core/utils/types/desunify.input';
import {
  UnifiedEcommerceOrderInput,
  UnifiedEcommerceOrderOutput,
} from './model.unified';
import { OriginalOrderOutput } from '@@core/utils/types/original/original.ecommerce';
import { ApiResponse } from '@@core/utils/types';
import { IBaseObjectService, SyncParam } from '@@core/utils/types/interface';

export interface IOrderService extends IBaseObjectService {
  addOrder?(
    orderData: DesunifyReturnType,
    linkedUserId: string,
  ): Promise<ApiResponse<OriginalOrderOutput>>;

  sync(data: SyncParam): Promise<ApiResponse<OriginalOrderOutput[]>>;
}

export interface IOrderMapper {
  desunify(
    source: UnifiedEcommerceOrderInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): DesunifyReturnType;

  unify(
    source: OriginalOrderOutput | OriginalOrderOutput[],
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedEcommerceOrderOutput | UnifiedEcommerceOrderOutput[]>;
}
