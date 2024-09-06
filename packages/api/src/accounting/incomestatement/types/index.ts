import { DesunifyReturnType } from '@@core/utils/types/desunify.input';
import {
  UnifiedAccountingIncomestatementInput,
  UnifiedAccountingIncomestatementOutput,
} from './model.unified';
import { OriginalIncomeStatementOutput } from '@@core/utils/types/original/original.accounting';
import { ApiResponse } from '@@core/utils/types';
import { SyncParam } from '@@core/utils/types/interface';

export interface IIncomeStatementService {
  addIncomeStatement(
    incomestatementData: DesunifyReturnType,
    linkedUserId: string,
  ): Promise<ApiResponse<OriginalIncomeStatementOutput>>;

  sync(data: SyncParam): Promise<ApiResponse<OriginalIncomeStatementOutput[]>>;
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
  ): Promise<
    | UnifiedAccountingIncomestatementOutput
    | UnifiedAccountingIncomestatementOutput[]
  >;
}
