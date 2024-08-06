import { DesunifyReturnType } from '@@core/utils/types/desunify.input';
import {
  UnifiedAccountingIncomestatementInput,
  UnifiedAccountingIncomestatementOutput,
} from './model.unified';
import { OriginalIncomeStatementOutput } from '@@core/utils/types/original/original.accounting';
import { ApiResponse } from '@@core/utils/types';

export interface IIncomeStatementService {
  addIncomeStatement(
    incomestatementData: DesunifyReturnType,
    linkedUserId: string,
  ): Promise<ApiResponse<OriginalIncomeStatementOutput>>;

  syncIncomeStatements(
    linkedUserId: string,
    custom_properties?: string[],
  ): Promise<ApiResponse<OriginalIncomeStatementOutput[]>>;
}

export interface IIncomeStatementMapper {
  desunify(
    source: UnifiedAccountingIncomestatementInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): DesunifyReturnType;

  unify(
    source: OriginalIncomeStatementOutput | OriginalIncomeStatementOutput[],
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedAccountingIncomestatementOutput | UnifiedAccountingIncomestatementOutput[]>;
}
