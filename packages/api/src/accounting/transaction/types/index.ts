import { DesunifyReturnType } from '@@core/utils/types/desunify.input';
import {
  UnifiedTransactionInput,
  UnifiedTransactionOutput,
} from './model.unified';
import { OriginalTransactionOutput } from '@@core/utils/types/original/original.accounting';
import { ApiResponse } from '@@core/utils/types';

export interface ITransactionService {
  addTransaction(
    transactionData: DesunifyReturnType,
    linkedUserId: string,
  ): Promise<ApiResponse<OriginalTransactionOutput>>;

  syncTransactions(
    linkedUserId: string,
    custom_properties?: string[],
  ): Promise<ApiResponse<OriginalTransactionOutput[]>>;
}

export interface ITransactionMapper {
  desunify(
    source: UnifiedTransactionInput,
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
  ): Promise<UnifiedTransactionOutput | UnifiedTransactionOutput[]>;
}
