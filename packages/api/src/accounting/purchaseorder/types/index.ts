import { DesunifyReturnType } from '@@core/utils/types/desunify.input';
import { UnifiedPurchaseorderInput, UnifiedPurchaseorderOutput } from './model.unified';
import { OriginalPurchaseorderOutput } from '@@core/utils/types/original/original.accounting';
import { ApiResponse } from '@@core/utils/types';

export interface IPurchaseorderService {
  addPurchaseorder(
    purchaseorderData: DesunifyReturnType,
    linkedUserId: string,
  ): Promise<ApiResponse<OriginalPurchaseorderOutput>>;

  syncPurchaseorders(
    linkedUserId: string,
    custom_properties?: string[],
  ): Promise<ApiResponse<OriginalPurchaseorderOutput[]>>;
}

export interface IPurchaseorderMapper {
  desunify(
    source: UnifiedPurchaseorderInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): DesunifyReturnType;

  unify(
    source: OriginalPurchaseorderOutput | OriginalPurchaseorderOutput[],
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): UnifiedPurchaseorderOutput | UnifiedPurchaseorderOutput[];
}
