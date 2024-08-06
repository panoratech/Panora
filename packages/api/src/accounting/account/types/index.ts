import { DesunifyReturnType } from '@@core/utils/types/desunify.input';
import { UnifiedAccountingAccountInput, UnifiedAccountingAccountOutput } from './model.unified';
import { OriginalAccountOutput } from '@@core/utils/types/original/original.accounting';
import { ApiResponse } from '@@core/utils/types';

export interface IAccountService {
  addAccount(
    accountData: DesunifyReturnType,
    linkedUserId: string,
  ): Promise<ApiResponse<OriginalAccountOutput>>;

  syncAccounts(
    linkedUserId: string,
    custom_properties?: string[],
  ): Promise<ApiResponse<OriginalAccountOutput[]>>;
}

export interface IAccountMapper {
  desunify(
    source: UnifiedAccountingAccountInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): DesunifyReturnType;

  unify(
    source: OriginalAccountOutput | OriginalAccountOutput[],
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedAccountingAccountOutput | UnifiedAccountingAccountOutput[]>;
}
