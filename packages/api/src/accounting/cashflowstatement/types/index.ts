import { DesunifyReturnType } from '@@core/utils/types/desunify.input';
import {
  UnifiedCashflowStatementInput,
  UnifiedCashflowStatementOutput,
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
    source: UnifiedCashflowStatementInput,
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
  ): Promise<UnifiedCashflowStatementOutput | UnifiedCashflowStatementOutput[]>;
}
