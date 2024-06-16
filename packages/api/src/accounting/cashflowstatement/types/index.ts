import { DesunifyReturnType } from '@@core/utils/types/desunify.input';
import { UnifiedCashflowstatementInput, UnifiedCashflowstatementOutput } from './model.unified';
import { OriginalCashflowstatementOutput } from '@@core/utils/types/original/original.accounting';
import { ApiResponse } from '@@core/utils/types';

export interface ICashflowstatementService {
  addCashflowstatement(
    cashflowstatementData: DesunifyReturnType,
    linkedUserId: string,
  ): Promise<ApiResponse<OriginalCashflowstatementOutput>>;

  syncCashflowstatements(
    linkedUserId: string,
    custom_properties?: string[],
  ): Promise<ApiResponse<OriginalCashflowstatementOutput[]>>;
}

export interface ICashflowstatementMapper {
  desunify(
    source: UnifiedCashflowstatementInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): DesunifyReturnType;

  unify(
    source: OriginalCashflowstatementOutput | OriginalCashflowstatementOutput[],
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): UnifiedCashflowstatementOutput | UnifiedCashflowstatementOutput[];
}
