import { DesunifyReturnType } from '@@core/utils/types/desunify.input';
import {
  UnifiedAccountingTransactionInput,
  UnifiedAccountingTransactionOutput,
} from './model.unified';
import { OriginalTransactionOutput } from '@@core/utils/types/original/original.accounting';
import { ApiResponse } from '@@core/utils/types';
import { SyncParam } from '@@core/utils/types/interface';

export interface ITransactionService {
  addTransaction(
    transactionData: DesunifyReturnType,
    linkedUserId: string,
  ): Promise<ApiResponse<OriginalTransactionOutput>>;

  sync(data: SyncParam): Promise<ApiResponse<OriginalTransactionOutput[]>>;
}

export interface ITransactionMapper {
  desunify(
    source: UnifiedAccountingTransactionInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): DesunifyReturnType;

  unify(
    source: OriginalTransactionOutput | OriginalTransactionOutput[],
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<
    UnifiedAccountingTransactionOutput | UnifiedAccountingTransactionOutput[]
  >;
}
