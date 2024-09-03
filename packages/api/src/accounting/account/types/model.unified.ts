import { CurrencyCode } from '@@core/utils/types';
import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsUUID,
  IsOptional,
  IsString,
  IsNumber,
  IsDateString,
} from 'class-validator';

export class UnifiedAccountingAccountInput {
  @ApiPropertyOptional({
    type: String,
    example: 'Cash',
    nullable: true,
    description: 'The name of the account',
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({
    type: String,
    example: 'Main cash account for daily operations',
    nullable: true,
    description: 'A description of the account',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    type: String,
    example: 'Asset',
    nullable: true,
    description: 'The classification of the account',
  })
  @IsString()
  @IsOptional()
  classification?: string;

  @ApiPropertyOptional({
    type: String,
    example: 'Current Asset',
    nullable: true,
    description: 'The type of the account',
  })
  @IsString()
  @IsOptional()
  type?: string;

  @ApiPropertyOptional({
    type: String,
    example: 'Active',
    nullable: true,
    description: 'The status of the account',
  })
  @IsString()
  @IsOptional()
  status?: string;

  @ApiPropertyOptional({
    type: Number,
    example: 10000,
    nullable: true,
    description: 'The current balance of the account',
  })
  @IsNumber()
  @IsOptional()
  current_balance?: number;

  @ApiPropertyOptional({
    type: String,
    example: 'USD',
    // enum: CurrencyCode,
    nullable: true,
    description: 'The currency of the account',
  })
  @IsString()
  @IsOptional()
  currency?: CurrencyCode;

  @ApiPropertyOptional({
    type: String,
    example: '1000',
    nullable: true,
    description: 'The account number',
  })
  @IsString()
  @IsOptional()
  account_number?: string;

  @ApiPropertyOptional({
    type: String,
    example: '801f9ede-c698-4e66-a7fc-48d19eebaa4f',
    nullable: true,
    description: 'The UUID of the parent account',
  })
  @IsUUID()
  @IsOptional()
  parent_account?: string;

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

export class UnifiedAccountingAccountOutput extends UnifiedAccountingAccountInput {
  @ApiPropertyOptional({
    type: String,
    example: '801f9ede-c698-4e66-a7fc-48d19eebaa4f',
    nullable: true,
    description: 'The UUID of the account record',
  })
  @IsUUID()
  @IsOptional()
  id?: string;

  @ApiPropertyOptional({
    type: String,
    example: 'account_1234',
    nullable: true,
    description: 'The remote ID of the account in the context of the 3rd Party',
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
      'The remote data of the account in the context of the 3rd Party',
  })
  @IsOptional()
  remote_data?: Record<string, any>;

  @ApiPropertyOptional({
    type: Date,
    example: '2024-06-15T12:00:00Z',
    nullable: true,
    description: 'The created date of the account record',
  })
  @IsDateString()
  @IsOptional()
  created_at?: Date;

  @ApiPropertyOptional({
    type: Date,
    example: '2024-06-15T12:00:00Z',
    nullable: true,
    description: 'The last modified date of the account record',
  })
  @IsDateString()
  @IsOptional()
  modified_at?: Date;
}
