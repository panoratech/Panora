import { DesunifyReturnType } from '@@core/utils/types/desunify.input';
import { UnifiedBankInfoInput, UnifiedBankInfoOutput } from './model.unified';
import { OriginalBankInfoOutput } from '@@core/utils/types/original/original.hris';
import { ApiResponse } from '@@core/utils/types';

export interface IBankInfoService {
  addBankinfo(
    bankinfoData: DesunifyReturnType,
    linkedUserId: string,
  ): Promise<ApiResponse<OriginalBankInfoOutput>>;

  syncBankinfos(
    linkedUserId: string,
    custom_properties?: string[],
  ): Promise<ApiResponse<OriginalBankInfoOutput[]>>;
}

export interface IBankinfoMapper {
  desunify(
    source: UnifiedBankInfoInput,
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
  ): Promise<UnifiedBankInfoOutput | UnifiedBankInfoOutput[]>;
}
