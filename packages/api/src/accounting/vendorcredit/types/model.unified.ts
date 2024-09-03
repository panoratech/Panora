import { CurrencyCode } from '@@core/utils/types';
import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsUUID,
  IsOptional,
  IsString,
  IsNumber,
  IsDateString,
  IsArray,
} from 'class-validator';

export class LineItem {
  @ApiPropertyOptional({
    type: String,
    example: '100',
    nullable: true,
    description: 'The net amount of the line item',
  })
  @IsString()
  @IsOptional()
  net_amount?: string;

  @ApiPropertyOptional({
    type: [String],
    example: ['801f9ede-c698-4e66-a7fc-48d19eebaa4f'],
    nullable: true,
    description:
      'The UUIDs of the tracking categories associated with the line item',
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tracking_categories?: string[];

  @ApiPropertyOptional({
    type: String,
    example: 'Office supplies',
    nullable: true,
    description: 'Description of the line item',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    type: String,
    example: '801f9ede-c698-4e66-a7fc-48d19eebaa4f',
    nullable: true,
    description: 'The UUID of the associated account',
  })
  @IsUUID()
  @IsOptional()
  account_id?: string;

  @ApiPropertyOptional({
    type: String,
    example: '1.0',
    nullable: true,
    description: 'The exchange rate for the line item',
  })
  @IsString()
  @IsOptional()
  exchange_rate?: string;

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
    type: String,
    example: 'remote_line_item_id_1234',
    nullable: true,
    description: 'The remote ID of the line item',
  })
  @IsString()
  @IsOptional()
  remote_id?: string;

  @ApiPropertyOptional({
    type: Date,
    example: '2024-06-15T12:00:00Z',
    description: 'The created date of the line item',
  })
  @IsDateString()
  created_at: Date;

  @ApiPropertyOptional({
    type: Date,
    example: '2024-06-15T12:00:00Z',
    description: 'The last modified date of the line item',
  })
  @IsDateString()
  modified_at: Date;

  @ApiPropertyOptional({
    type: String,
    example: '801f9ede-c698-4e66-a7fc-48d19eebaa4f',
    nullable: true,
    description: 'The UUID of the associated vendor credit',
  })
  @IsUUID()
  @IsOptional()
  vendor_credit_id?: string;
}

export class UnifiedAccountingVendorcreditInput {
  @ApiPropertyOptional({
    type: String,
    example: 'VC-001',
    nullable: true,
    description: 'The number of the vendor credit',
  })
  @IsString()
  @IsOptional()
  number?: string;

  @ApiPropertyOptional({
    type: Date,
    example: '2024-06-15T12:00:00Z',
    nullable: true,
    description: 'The date of the transaction',
  })
  @IsDateString()
  @IsOptional()
  transaction_date?: Date;

  @ApiPropertyOptional({
    type: String,
    example: '801f9ede-c698-4e66-a7fc-48d19eebaa4f',
    nullable: true,
    description: 'The UUID of the vendor associated with the credit',
  })
  @IsUUID()
  @IsOptional()
  vendor?: string;

  @ApiPropertyOptional({
    type: String,
    example: '1000',
    nullable: true,
    description: 'The total amount of the vendor credit',
  })
  @IsNumber()
  @IsOptional()
  total_amount?: number;

  @ApiPropertyOptional({
    type: String,
    example: 'USD',
    nullable: true,
    // enum: CurrencyCode,
    description: 'The currency of the vendor credit',
  })
  @IsString()
  @IsOptional()
  currency?: CurrencyCode;

  @ApiPropertyOptional({
    type: String,
    example: '1.2',
    nullable: true,
    description: 'The exchange rate applied to the vendor credit',
  })
  @IsString()
  @IsOptional()
  exchange_rate?: string;

  @ApiPropertyOptional({
    type: String,
    example: '801f9ede-c698-4e66-a7fc-48d19eebaa4f',
    nullable: true,
    description: 'The UUID of the associated company',
  })
  @IsUUID()
  @IsOptional()
  company_id?: string;

  @ApiPropertyOptional({
    type: [String],
    example: ['801f9ede-c698-4e66-a7fc-48d19eebaa4f'],
    nullable: true,
    description:
      'The UUID of the tracking categories associated with the vendor credit',
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tracking_categories?: string[];

  @ApiPropertyOptional({
    type: String,
    example: '801f9ede-c698-4e66-a7fc-48d19eebaa4f',
    nullable: true,
    description: 'The UUID of the associated accounting period',
  })
  @IsUUID()
  @IsOptional()
  accounting_period_id?: string;

  @ApiPropertyOptional({
    type: [LineItem],
    description: 'The line items associated with this vendor credit',
  })
  @IsArray()
  @IsOptional()
  line_items?: LineItem[];

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

export class UnifiedAccountingVendorcreditOutput extends UnifiedAccountingVendorcreditInput {
  @ApiPropertyOptional({
    type: String,
    example: '801f9ede-c698-4e66-a7fc-48d19eebaa4f',
    nullable: true,
    description: 'The UUID of the vendor credit record',
  })
  @IsUUID()
  @IsOptional()
  id?: string;

  @ApiPropertyOptional({
    type: String,
    example: 'remote_id_1234',
    nullable: true,
    description: 'The remote ID of the vendor credit',
  })
  @IsString()
  @IsOptional()
  remote_id?: string;

  @ApiPropertyOptional({
    type: Date,
    example: '2024-06-15T12:00:00Z',
    nullable: false,
    description: 'The created date of the vendor credit',
  })
  @IsDateString()
  created_at: string;

  @ApiPropertyOptional({
    type: Date,
    example: '2024-06-15T12:00:00Z',
    nullable: false,
    description: 'The last modified date of the vendor credit',
  })
  @IsDateString()
  modified_at: Date;

  @ApiPropertyOptional({
    type: Date,
    example: '2024-06-15T12:00:00Z',
    nullable: true,
    description:
      'The date when the vendor credit was last updated in the remote system',
  })
  @IsDateString()
  @IsOptional()
  remote_updated_at?: Date;

  @ApiPropertyOptional({
    type: Object,
    example: {
      raw_data: {
        additional_field: 'some value',
      },
    },
    nullable: true,
    description:
      'The remote data of the vendor credit in the context of the 3rd Party',
  })
  @IsOptional()
  remote_data?: Record<string, any>;
}
