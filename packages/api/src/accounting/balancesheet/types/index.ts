import { DesunifyReturnType } from '@@core/utils/types/desunify.input';
import { UnifiedBalancesheetInput, UnifiedBalancesheetOutput } from './model.unified';
import { OriginalBalancesheetOutput } from '@@core/utils/types/original/original.accounting';
import { ApiResponse } from '@@core/utils/types';

export interface IBalancesheetService {
  addBalancesheet(
    balancesheetData: DesunifyReturnType,
    linkedUserId: string,
  ): Promise<ApiResponse<OriginalBalancesheetOutput>>;

  syncBalancesheets(
    linkedUserId: string,
    custom_properties?: string[],
  ): Promise<ApiResponse<OriginalBalancesheetOutput[]>>;
}

export interface IBalancesheetMapper {
  desunify(
    source: UnifiedBalancesheetInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): DesunifyReturnType;

  unify(
    source: OriginalBalancesheetOutput | OriginalBalancesheetOutput[],
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): UnifiedBalancesheetOutput | UnifiedBalancesheetOutput[];
}
