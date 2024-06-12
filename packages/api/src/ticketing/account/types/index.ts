import { DesunifyReturnType } from '@@core/utils/types/desunify.input';
import { UnifiedAccountInput, UnifiedAccountOutput } from './model.unified';
import { OriginalAccountOutput } from '@@core/utils/types/original/original.ticketing';
import { ApiResponse } from '@@core/utils/types';

export interface IAccountService {
  syncAccounts(
    linkedUserId: string,
    remote_account_id?: string,
    custom_properties?: string[],
  ): Promise<ApiResponse<OriginalAccountOutput[]>>;
}

export interface IAccountMapper {
  desunify(
    source: UnifiedAccountInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): DesunifyReturnType;

  unify(
    source: OriginalAccountOutput | OriginalAccountOutput[],
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): UnifiedAccountOutput | UnifiedAccountOutput[];
}
