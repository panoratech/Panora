import { DesunifyReturnType } from '@@core/utils/types/desunify.input';
import {
  UnifiedAccountingInvoiceInput,
  UnifiedAccountingInvoiceOutput,
} from './model.unified';
import { OriginalInvoiceOutput } from '@@core/utils/types/original/original.accounting';
import { ApiResponse } from '@@core/utils/types';
import { SyncParam } from '@@core/utils/types/interface';

export interface IInvoiceService {
  addInvoice(
    invoiceData: DesunifyReturnType,
    linkedUserId: string,
  ): Promise<ApiResponse<OriginalInvoiceOutput>>;

  sync(data: SyncParam): Promise<ApiResponse<OriginalInvoiceOutput[]>>;
}

export interface IInvoiceMapper {
  desunify(
    source: UnifiedAccountingInvoiceInput,
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
  ): Promise<UnifiedAccountingInvoiceOutput | UnifiedAccountingInvoiceOutput[]>;
}
