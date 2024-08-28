import { CurrencyCode } from '@@core/utils/types';
import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsUUID,
  IsOptional,
  IsString,
  IsBoolean,
  IsEmail,
  IsDateString,
} from 'class-validator';

export class UnifiedAccountingContactInput {
  @ApiPropertyOptional({
    type: String,
    example: 'John Doe',
    nullable: true,
    description: 'The name of the contact',
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({
    type: Boolean,
    example: true,
    nullable: true,
    description: 'Indicates if the contact is a supplier',
  })
  @IsBoolean()
  @IsOptional()
  is_supplier?: boolean;

  @ApiPropertyOptional({
    type: Boolean,
    example: false,
    nullable: true,
    description: 'Indicates if the contact is a customer',
  })
  @IsBoolean()
  @IsOptional()
  is_customer?: boolean;

  @ApiPropertyOptional({
    type: String,
    example: 'john.doe@example.com',
    nullable: true,
    description: 'The email address of the contact',
  })
  @IsEmail()
  @IsOptional()
  email_address?: string;

  @ApiPropertyOptional({
    type: String,
    example: '123456789',
    nullable: true,
    description: 'The tax number of the contact',
  })
  @IsString()
  @IsOptional()
  tax_number?: string;

  @ApiPropertyOptional({
    type: String,
    example: 'Active',
    nullable: true,
    description: 'The status of the contact',
  })
  @IsString()
  @IsOptional()
  status?: string;

  @ApiPropertyOptional({
    type: String,
    example: 'USD',
    nullable: true,
    // enum: CurrencyCode,
    description: 'The currency associated with the contact',
  })
  @IsString()
  @IsOptional()
  currency?: CurrencyCode;

  @ApiPropertyOptional({
    type: String,
    example: '2024-06-15T12:00:00Z',
    nullable: true,
    description:
      'The date when the contact was last updated in the remote system',
  })
  @IsDateString()
  @IsOptional()
  remote_updated_at?: string;

  @ApiPropertyOptional({
    type: String,
    example: '801f9ede-c698-4e66-a7fc-48d19eebaa4f',
    nullable: true,
    description: 'The UUID of the associated company info',
  })
  @IsUUID()
  @IsOptional()
  company_info_id?: string;

  @ApiPropertyOptional({
    type: Object,
    example: {
      custom_field_1: 'value1',
      custom_field_2: 'value2',
    },
    nullable: true,
    description:
      'The custom field mappings of the object between the remote 3rd party & Panora',
  })
  @IsOptional()
  field_mappings?: Record<string, any>;
}

export class UnifiedAccountingContactOutput extends UnifiedAccountingContactInput {
  @ApiPropertyOptional({
    type: String,
    example: '801f9ede-c698-4e66-a7fc-48d19eebaa4f',
    nullable: true,
    description: 'The UUID of the contact record',
  })
  @IsUUID()
  @IsOptional()
  id?: string;

  @ApiPropertyOptional({
    type: String,
    example: 'contact_1234',
    nullable: true,
    description: 'The remote ID of the contact in the context of the 3rd Party',
  })
  @IsString()
  @IsOptional()
  remote_id?: string;

  @ApiPropertyOptional({
    type: Object,
    example: {
      raw_data: {
        additional_field: 'some value',
      },
    },
    nullable: true,
    description:
      'The remote data of the contact in the context of the 3rd Party',
  })
  @IsOptional()
  remote_data?: Record<string, any>;

  @ApiPropertyOptional({
    type: Date,
    example: '2024-06-15T12:00:00Z',
    nullable: true,
    description: 'The created date of the contact record',
  })
  @IsDateString()
  @IsOptional()
  created_at?: Date;

  @ApiPropertyOptional({
    type: Date,
    example: '2024-06-15T12:00:00Z',
    nullable: true,
    description: 'The last modified date of the contact record',
  })
  @IsDateString()
  @IsOptional()
  modified_at?: Date;
}
