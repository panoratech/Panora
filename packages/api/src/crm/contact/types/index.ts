import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UnifiedContactInput, UnifiedContactOutput } from './model.unified';
import { ApiResponse } from '@@core/utils/types';
import { DesunifyReturnType } from '@@core/utils/types/desunify.input';
import { OriginalContactOutput } from '@@core/utils/types/original.output';
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

export class Email {
  @ApiProperty({
    description: 'The email address of a contact',
  })
  email_address: string;
  @ApiProperty({
    description: 'The email address type of a contact',
  })
  email_address_type: string;
  @ApiPropertyOptional({
    description: 'The owner type of a the email tied to the contact',
  })
  owner_type?: string;
}

export class Phone {
  @ApiProperty({
    description: 'The phone number of a contact',
  })
  phone_number: string;
  @ApiProperty({
    description: 'The phone type of a contact',
  })
  phone_type: string;
  @ApiPropertyOptional()
  owner_type?: string;
}

export type NormalizedContactInfo = {
  normalizedEmails: Email[];
  normalizedPhones: Phone[];
};

export class ContactResponse {
  @ApiProperty({ type: [UnifiedContactOutput] })
  contacts: UnifiedContactOutput[];
  @ApiPropertyOptional({ type: [{}] })
  remote_data?: Record<string, any>[]; //data in original format
}
