import { DesunifyReturnType } from '@@core/utils/types/desunify.input';
import { UnifiedContactInput, UnifiedContactOutput } from './model.unified';
import { ApiResponse } from '@@core/utils/types';
import { OriginalContactOutput } from '@@core/utils/types/original/original.ticketing';

export interface IContactService {
  syncContacts(
    linkedUserId: string,
    remote_account_id?: string,
    custom_properties?: string[],
  ): Promise<ApiResponse<OriginalContactOutput[]>>;
}

export interface IContactMapper {
  desunify(
    source: UnifiedContactInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): DesunifyReturnType;

  unify(
    source: OriginalContactOutput | OriginalContactOutput[],
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): UnifiedContactOutput | UnifiedContactOutput[];
}
