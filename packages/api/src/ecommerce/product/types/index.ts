import { DesunifyReturnType } from '@@core/utils/types/desunify.input';
import {
  UnifiedEcommerceProductInput,
  UnifiedEcommerceProductOutput,
} from './model.unified';
import { OriginalProductOutput } from '@@core/utils/types/original/original.ecommerce';
import { ApiResponse } from '@@core/utils/types';
import { IBaseObjectService, SyncParam } from '@@core/utils/types/interface';

export interface IProductService extends IBaseObjectService {
  addProduct?(
    productData: DesunifyReturnType,
    linkedUserId: string,
  ): Promise<ApiResponse<OriginalProductOutput>>;

  sync(data: SyncParam): Promise<ApiResponse<OriginalProductOutput[]>>;
}

export interface IProductMapper {
  desunify(
    source: UnifiedEcommerceProductInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): DesunifyReturnType;

  unify(
    source: OriginalProductOutput | OriginalProductOutput[],
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedEcommerceProductOutput | UnifiedEcommerceProductOutput[]>;
}
