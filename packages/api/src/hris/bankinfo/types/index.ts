import { DesunifyReturnType } from '@@core/utils/types/desunify.input';
import {
  UnifiedHrisBankinfoInput,
  UnifiedHrisBankinfoOutput,
} from './model.unified';
import { OriginalBankInfoOutput } from '@@core/utils/types/original/original.hris';
import { ApiResponse } from '@@core/utils/types';
import { SyncParam } from '@@core/utils/types/interface';

export interface IBankInfoService {
  sync(data: SyncParam): Promise<ApiResponse<OriginalBankInfoOutput[]>>;
}

export interface IBankinfoMapper {
  desunify(
    source: UnifiedHrisBankinfoInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): DesunifyReturnType;

  unify(
    source: OriginalBankInfoOutput | OriginalBankInfoOutput[],
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedHrisBankinfoOutput | UnifiedHrisBankinfoOutput[]>;
}
