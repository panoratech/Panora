import {
  ApiExtraModels,
  ApiOkResponse,
  ApiProperty,
  ApiPropertyOptional,
  getSchemaPath,
} from '@nestjs/swagger';
import { UnifiedContactOutput } from './model.unified';
import { Type, applyDecorators } from '@nestjs/common';

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
  @ApiProperty()
  email_address: string;
  @ApiProperty()
  email_address_type: string;
  @ApiPropertyOptional()
  owner_type?: string;
}

export class Phone {
  @ApiProperty()
  phone_number: string;
  @ApiProperty()
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
