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
    example: 'Item description',
    nullable: true,
    description: 'Description of the line item',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    type: Number,
    example: 1000,
    nullable: true,
    description: 'The unit price of the item in cents',
  })
  @IsNumber()
  @IsOptional()
  unit_price?: number;

  @ApiPropertyOptional({
    type: Number,
    example: 5,
    nullable: true,
    description: 'The quantity of the item',
  })
  @IsNumber()
  @IsOptional()
  quantity?: number;

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
    type: Number,
    example: 500,
    nullable: true,
    description: 'The tax amount for the line item in cents',
  })
  @IsNumber()
  @IsOptional()
  tax_amount?: number;

  @ApiPropertyOptional({
    type: Number,
    example: 5500,
    nullable: true,
    description: 'The total amount for the line item in cents',
  })
  @IsNumber()
  @IsOptional()
  total_line_amount?: number;

  @ApiPropertyOptional({
    type: String,
    example: 'USD',
    nullable: true,
    // enum: CurrencyCode,
    description: 'The currency of the line item',
  })
  @IsString()
  @IsOptional()
  currency?: CurrencyCode;

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
    description: 'The UUID of the associated account',
  })
  @IsUUID()
  @IsOptional()
  account_id?: string;

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
  @IsOptional()
  created_at?: Date;

  @ApiPropertyOptional({
    type: Date,
    example: '2024-06-15T12:00:00Z',
    description: 'The last modified date of the line item',
  })
  @IsDateString()
  @IsOptional()
  modified_at?: Date;
}

export class UnifiedAccountingPurchaseorderInput {
  @ApiPropertyOptional({
    type: String,
    example: 'Pending',
    nullable: true,
    description: 'The status of the purchase order',
  })
  @IsString()
  @IsOptional()
  status?: string;

  @ApiPropertyOptional({
    type: Date,
    example: '2024-06-15T12:00:00Z',
    nullable: true,
    description: 'The issue date of the purchase order',
  })
  @IsDateString()
  @IsOptional()
  issue_date?: Date;

  @ApiPropertyOptional({
    type: String,
    example: 'PO-001',
    nullable: true,
    description: 'The purchase order number',
  })
  @IsString()
  @IsOptional()
  purchase_order_number?: string;

  @ApiPropertyOptional({
    type: Date,
    example: '2024-07-15T12:00:00Z',
    nullable: true,
    description: 'The delivery date for the purchase order',
  })
  @IsDateString()
  @IsOptional()
  delivery_date?: Date;

  @ApiPropertyOptional({
    type: String,
    example: '801f9ede-c698-4e66-a7fc-48d19eebaa4f',
    nullable: true,
    description: 'The UUID of the delivery address',
  })
  @IsUUID()
  @IsOptional()
  delivery_address?: string;

  @ApiPropertyOptional({
    type: String,
    example: '801f9ede-c698-4e66-a7fc-48d19eebaa4f',
    nullable: true,
    description: 'The UUID of the customer',
  })
  @IsUUID()
  @IsOptional()
  customer?: string;

  @ApiPropertyOptional({
    type: String,
    example: '801f9ede-c698-4e66-a7fc-48d19eebaa4f',
    nullable: true,
    description: 'The UUID of the vendor',
  })
  @IsUUID()
  @IsOptional()
  vendor?: string;

  @ApiPropertyOptional({
    type: String,
    example: 'Purchase order for Q3 inventory',
    nullable: true,
    description: 'A memo or note for the purchase order',
  })
  @IsString()
  @IsOptional()
  memo?: string;

  @ApiPropertyOptional({
    type: String,
    example: '801f9ede-c698-4e66-a7fc-48d19eebaa4f',
    nullable: true,
    description: 'The UUID of the company',
  })
  @IsUUID()
  @IsOptional()
  company_id?: string;

  @ApiPropertyOptional({
    type: Number,
    example: 100000,
    nullable: true,
    description: 'The total amount of the purchase order in cents',
  })
  @IsNumber()
  @IsOptional()
  total_amount?: number;

  @ApiPropertyOptional({
    type: String,
    example: 'USD',
    // enum: CurrencyCode,
    nullable: true,
    description: 'The currency of the purchase order',
  })
  @IsString()
  @IsOptional()
  currency?: CurrencyCode;

  @ApiPropertyOptional({
    type: String,
    example: '1.2',
    nullable: true,
    description: 'The exchange rate applied to the purchase order',
  })
  @IsString()
  @IsOptional()
  exchange_rate?: string;

  @ApiPropertyOptional({
    type: [String],
    example: ['801f9ede-c698-4e66-a7fc-48d19eebaa4f'],
    nullable: true,
    description:
      'The UUIDs of the tracking categories associated with the purchase order',
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
    description: 'The line items associated with this purchase order',
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

export class UnifiedAccountingPurchaseorderOutput extends UnifiedAccountingPurchaseorderInput {
  @ApiPropertyOptional({
    type: String,
    example: '801f9ede-c698-4e66-a7fc-48d19eebaa4f',
    nullable: true,
    description: 'The UUID of the purchase order record',
  })
  @IsUUID()
  @IsOptional()
  id?: string;

  @ApiPropertyOptional({
    type: String,
    example: 'po_1234',
    nullable: true,
    description:
      'The remote ID of the purchase order in the context of the 3rd Party',
  })
  @IsString()
  @IsOptional()
  remote_id?: string;

  @ApiPropertyOptional({
    type: Date,
    example: '2024-06-15T12:00:00Z',
    nullable: true,
    description:
      'The date when the purchase order was created in the remote system',
  })
  @IsDateString()
  @IsOptional()
  remote_created_at?: Date;

  @ApiPropertyOptional({
    type: Date,
    example: '2024-06-15T12:00:00Z',
    nullable: true,
    description:
      'The date when the purchase order was last updated in the remote system',
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
      'The remote data of the purchase order in the context of the 3rd Party',
  })
  @IsOptional()
  remote_data?: Record<string, any>;

  @ApiPropertyOptional({
    type: Date,
    example: '2024-06-15T12:00:00Z',
    nullable: true,
    description: 'The created date of the purchase order record',
  })
  @IsDateString()
  @IsOptional()
  created_at?: Date;

  @ApiPropertyOptional({
    type: Date,
    example: '2024-06-15T12:00:00Z',
    nullable: true,
    description: 'The last modified date of the purchase order record',
  })
  @IsDateString()
  @IsOptional()
  modified_at?: Date;
}
