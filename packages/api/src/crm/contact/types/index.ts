import {
  ApiExtraModels,
  ApiOkResponse,
  ApiProperty,
  ApiPropertyOptional,
  getSchemaPath,
} from '@nestjs/swagger';
import { UnifiedContactInput, UnifiedContactOutput } from './model.unified';
import { Type, applyDecorators } from '@nestjs/common';
import { DesunifyReturnType, OriginalContactOutput } from '@@core/utils/types';
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

// Export other necessary types and functions specific to contacts

export class ApiResponse<T> {
  data: T;
  @ApiPropertyOptional()
  message?: string;
  @ApiPropertyOptional()
  error?: string;
  @ApiProperty({ type: Number })
  statusCode: number;
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

export const ApiCustomResponse = <DataDto extends Type<unknown>>(
  dataDto: DataDto,
) =>
  applyDecorators(
    ApiExtraModels(ApiResponse, dataDto),
    ApiOkResponse({
      schema: {
        allOf: [
          { $ref: getSchemaPath(ApiResponse) },
          {
            properties: {
              data: { $ref: getSchemaPath(dataDto) },
            },
          },
        ],
      },
    }),
  );
