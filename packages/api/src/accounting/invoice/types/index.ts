import { DesunifyReturnType } from '@@core/utils/types/desunify.input';
import { UnifiedInvoiceInput, UnifiedInvoiceOutput } from './model.unified';
import { OriginalInvoiceOutput } from '@@core/utils/types/original/original.accounting';
import { ApiResponse } from '@@core/utils/types';

export interface IInvoiceService {
  addInvoice(
    invoiceData: DesunifyReturnType,
    linkedUserId: string,
  ): Promise<ApiResponse<OriginalInvoiceOutput>>;

  syncInvoices(
    linkedUserId: string,
    custom_properties?: string[],
  ): Promise<ApiResponse<OriginalInvoiceOutput[]>>;
}

export interface IInvoiceMapper {
  desunify(
    source: UnifiedInvoiceInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): DesunifyReturnType;

  unify(
    source: OriginalInvoiceOutput | OriginalInvoiceOutput[],
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedInvoiceOutput | UnifiedInvoiceOutput[]>;
}
