import { DesunifyReturnType } from '@@core/utils/types/desunify.input';
import {
  UnifiedHrisPayrollrunInput,
  UnifiedHrisPayrollrunOutput,
} from './model.unified';
import { OriginalPayrollRunOutput } from '@@core/utils/types/original/original.hris';
import { ApiResponse } from '@@core/utils/types';
import { SyncParam } from '@@core/utils/types/interface';

export interface IPayrollRunService {
  sync(data: SyncParam): Promise<ApiResponse<OriginalPayrollRunOutput[]>>;
}

export interface IPayrollRunMapper {
  desunify(
    source: UnifiedHrisPayrollrunInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): DesunifyReturnType;

  unify(
    source: OriginalPayrollRunOutput | OriginalPayrollRunOutput[],
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedHrisPayrollrunOutput | UnifiedHrisPayrollrunOutput[]>;
}
