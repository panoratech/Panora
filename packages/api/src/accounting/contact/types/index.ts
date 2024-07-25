import { DesunifyReturnType } from '@@core/utils/types/desunify.input';
import { UnifiedAccountingContactInput, UnifiedAccountingContactOutput } from './model.unified';
import { OriginalContactOutput } from '@@core/utils/types/original/original.accounting';
import { ApiResponse } from '@@core/utils/types';

export interface IContactService {
  addContact(
    contactData: DesunifyReturnType,
    linkedUserId: string,
  ): Promise<ApiResponse<OriginalContactOutput>>;

  syncContacts(
    linkedUserId: string,
    custom_properties?: string[],
  ): Promise<ApiResponse<OriginalContactOutput[]>>;
}

export interface IContactMapper {
  desunify(
    source: UnifiedAccountingContactInput,
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
  ): Promise<UnifiedAccountingContactOutput | UnifiedAccountingContactOutput[]>;
}
