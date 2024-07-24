import { DesunifyReturnType } from '@@core/utils/types/desunify.input';
import {
  UnifiedAccountingCashflowstatementInput,
  UnifiedAccountingCashflowstatementOutput,
} from './model.unified';
import { OriginalCashflowStatementOutput } from '@@core/utils/types/original/original.accounting';
import { ApiResponse } from '@@core/utils/types';

export interface ICashflowStatementService {
  addCashflowStatement(
    cashflowstatementData: DesunifyReturnType,
    linkedUserId: string,
  ): Promise<ApiResponse<OriginalCashflowStatementOutput>>;

  syncCashflowStatements(
    linkedUserId: string,
    custom_properties?: string[],
  ): Promise<ApiResponse<OriginalCashflowStatementOutput[]>>;
}

export interface ICashflowStatementMapper {
  desunify(
    source: UnifiedAccountingCashflowstatementInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): DesunifyReturnType;

  unify(
    source: OriginalCashflowStatementOutput | OriginalCashflowStatementOutput[],
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedAccountingCashflowstatementOutput | UnifiedAccountingCashflowstatementOutput[]>;
}
