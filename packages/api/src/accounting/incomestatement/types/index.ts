import { DesunifyReturnType } from '@@core/utils/types/desunify.input';
import { UnifiedIncomestatementInput, UnifiedIncomestatementOutput } from './model.unified';
import { OriginalIncomestatementOutput } from '@@core/utils/types/original/original.accounting';
import { ApiResponse } from '@@core/utils/types';

export interface IIncomestatementService {
  addIncomestatement(
    incomestatementData: DesunifyReturnType,
    linkedUserId: string,
  ): Promise<ApiResponse<OriginalIncomestatementOutput>>;

  syncIncomestatements(
    linkedUserId: string,
    custom_properties?: string[],
  ): Promise<ApiResponse<OriginalIncomestatementOutput[]>>;
}

export interface IIncomestatementMapper {
  desunify(
    source: UnifiedIncomestatementInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): DesunifyReturnType;

  unify(
    source: OriginalIncomestatementOutput | OriginalIncomestatementOutput[],
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): UnifiedIncomestatementOutput | UnifiedIncomestatementOutput[];
}
