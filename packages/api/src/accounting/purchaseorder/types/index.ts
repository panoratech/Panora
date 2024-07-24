import { DesunifyReturnType } from '@@core/utils/types/desunify.input';
import {
  UnifiedAccountingPurchaseorderInput,
  UnifiedAccountingPurchaseorderOutput,
} from './model.unified';
import { OriginalPurchaseOrderOutput } from '@@core/utils/types/original/original.accounting';
import { ApiResponse } from '@@core/utils/types';

export interface IPurchaseOrderService {
  addPurchaseOrder(
    purchaseorderData: DesunifyReturnType,
    linkedUserId: string,
  ): Promise<ApiResponse<OriginalPurchaseOrderOutput>>;

  syncPurchaseOrders(
    linkedUserId: string,
    custom_properties?: string[],
  ): Promise<ApiResponse<OriginalPurchaseOrderOutput[]>>;
}

export interface IPurchaseOrderMapper {
  desunify(
    source: UnifiedAccountingPurchaseorderInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): DesunifyReturnType;

  unify(
    source: OriginalPurchaseOrderOutput | OriginalPurchaseOrderOutput[],
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedAccountingPurchaseorderOutput | UnifiedAccountingPurchaseorderOutput[]>;
}
