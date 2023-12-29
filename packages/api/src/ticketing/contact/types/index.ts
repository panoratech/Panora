import { DesunifyReturnType } from '@@core/utils/types/desunify.input';
import { UnifiedContactInput, UnifiedContactOutput } from './model.unified';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ApiResponse } from '@@core/utils/types';
import { OriginalContactOutput } from '@@core/utils/types/original/original.crm';

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
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): UnifiedContactOutput | UnifiedContactOutput[];
}

export class ContactResponse {
  @ApiProperty({ type: [UnifiedContactOutput] })
  contacts: UnifiedContactOutput[];

  @ApiPropertyOptional({ type: [{}] })
  remote_data?: Record<string, any>[]; // Data in original format
}
