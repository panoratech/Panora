import { DesunifyReturnType } from '@@core/utils/types/desunify.input';
import { UnifiedExpenseInput, UnifiedExpenseOutput } from './model.unified';
import { OriginalExpenseOutput } from '@@core/utils/types/original/original.accounting';
import { ApiResponse } from '@@core/utils/types';

export interface IExpenseService {
  addExpense(
    expenseData: DesunifyReturnType,
    linkedUserId: string,
  ): Promise<ApiResponse<OriginalExpenseOutput>>;

  syncExpenses(
    linkedUserId: string,
    custom_properties?: string[],
  ): Promise<ApiResponse<OriginalExpenseOutput[]>>;
}

export interface IExpenseMapper {
  desunify(
    source: UnifiedExpenseInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): DesunifyReturnType;

  unify(
    source: OriginalExpenseOutput | OriginalExpenseOutput[],
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedExpenseOutput | UnifiedExpenseOutput[]>;
}
