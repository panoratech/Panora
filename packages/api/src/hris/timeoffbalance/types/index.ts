import { DesunifyReturnType } from '@@core/utils/types/desunify.input';
import {
  UnifiedTimeoffBalanceInput,
  UnifiedTimeoffBalanceOutput,
} from './model.unified';
import { OriginalTimeoffBalanceOutput } from '@@core/utils/types/original/original.hris';
import { ApiResponse } from '@@core/utils/types';

export interface ITimeoffBalanceService {
  addTimeoffBalance(
    timeoffbalanceData: DesunifyReturnType,
    linkedUserId: string,
  ): Promise<ApiResponse<OriginalTimeoffBalanceOutput>>;

  syncTimeoffBalances(
    linkedUserId: string,
    custom_properties?: string[],
  ): Promise<ApiResponse<OriginalTimeoffBalanceOutput[]>>;
}

export interface ITimeoffBalanceMapper {
  desunify(
    source: UnifiedTimeoffBalanceInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): DesunifyReturnType;

  unify(
    source: OriginalTimeoffBalanceOutput | OriginalTimeoffBalanceOutput[],
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedTimeoffBalanceOutput | UnifiedTimeoffBalanceOutput[]>;
}
