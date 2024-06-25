import { DesunifyReturnType } from '@@core/utils/types/desunify.input';
import { UnifiedContactInput, UnifiedContactOutput } from './model.unified';
import { OriginalContactOutput } from '@@core/utils/types/original/original.marketing-automation';
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
  ): Promise<UnifiedContactOutput | UnifiedContactOutput[]>;
}
