import { DesunifyReturnType } from '@@core/utils/types/desunify.input';
import { UnifiedAccountingPaymentInput, UnifiedAccountingPaymentOutput } from './model.unified';
import { OriginalPaymentOutput } from '@@core/utils/types/original/original.accounting';
import { ApiResponse } from '@@core/utils/types';

export interface IPaymentService {
  addPayment(
    paymentData: DesunifyReturnType,
    linkedUserId: string,
  ): Promise<ApiResponse<OriginalPaymentOutput>>;

  syncPayments(
    linkedUserId: string,
    custom_properties?: string[],
  ): Promise<ApiResponse<OriginalPaymentOutput[]>>;
}

export interface IPaymentMapper {
  desunify(
    source: UnifiedAccountingPaymentInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): DesunifyReturnType;

  unify(
    source: OriginalPaymentOutput | OriginalPaymentOutput[],
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedAccountingPaymentOutput | UnifiedAccountingPaymentOutput[]>;
}
