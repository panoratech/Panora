import { DesunifyReturnType } from '@@core/utils/types/desunify.input';
import {
  UnifiedAccountingBalancesheetInput,
  UnifiedAccountingBalancesheetOutput,
} from './model.unified';
import { OriginalBalanceSheetOutput } from '@@core/utils/types/original/original.accounting';
import { ApiResponse } from '@@core/utils/types';
import { SyncParam } from '@@core/utils/types/interface';

export interface IBalanceSheetService {
  addBalanceSheet(
    balancesheetData: DesunifyReturnType,
    linkedUserId: string,
  ): Promise<ApiResponse<OriginalBalanceSheetOutput>>;

  sync(data: SyncParam): Promise<ApiResponse<OriginalBalanceSheetOutput[]>>;
}

export interface IBalanceSheetMapper {
  desunify(
    source: UnifiedAccountingBalancesheetInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): DesunifyReturnType;

  unify(
    source: OriginalBalanceSheetOutput | OriginalBalanceSheetOutput[],
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<
    UnifiedAccountingBalancesheetOutput | UnifiedAccountingBalancesheetOutput[]
  >;
}
