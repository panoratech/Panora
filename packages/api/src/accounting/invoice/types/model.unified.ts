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
    example: 'Product description',
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
    example: 2,
    nullable: true,
    description: 'The quantity of the item',
  })
  @IsNumber()
  @IsOptional()
  quantity?: number;

  @ApiPropertyOptional({
    type: Number,
    example: 2000,
    nullable: true,
    description: 'The total amount for the line item in cents',
  })
  @IsNumber()
  @IsOptional()
  total_amount?: number;

  @ApiPropertyOptional({
    type: String,
    example: 'USD',
    // enum: CurrencyCode,
    nullable: true,
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
    description: 'The UUID of the associated item',
  })
  @IsUUID()
  @IsOptional()
  item_id?: string;

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
    example: 'line_item_1234',
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

export class UnifiedAccountingInvoiceInput {
  @ApiPropertyOptional({
    type: String,
    example: 'Sales',
    nullable: true,
    description: 'The type of the invoice',
  })
  @IsString()
  @IsOptional()
  type?: string;

  @ApiPropertyOptional({
    type: String,
    example: 'INV-001',
    nullable: true,
    description: 'The invoice number',
  })
  @IsString()
  @IsOptional()
  number?: string;

  @ApiPropertyOptional({
    type: Date,
    example: '2024-06-15T12:00:00Z',
    nullable: true,
    description: 'The date the invoice was issued',
  })
  @IsDateString()
  @IsOptional()
  issue_date?: Date;

  @ApiPropertyOptional({
    type: Date,
    example: '2024-07-15T12:00:00Z',
    nullable: true,
    description: 'The due date of the invoice',
  })
  @IsDateString()
  @IsOptional()
  due_date?: Date;

  @ApiPropertyOptional({
    type: Date,
    example: '2024-07-10T12:00:00Z',
    nullable: true,
    description: 'The date the invoice was paid',
  })
  @IsDateString()
  @IsOptional()
  paid_on_date?: Date;

  @ApiPropertyOptional({
    type: String,
    example: 'Payment for services rendered',
    nullable: true,
    description: 'A memo or note on the invoice',
  })
  @IsString()
  @IsOptional()
  memo?: string;

  @ApiPropertyOptional({
    type: String,
    example: 'USD',
    // enum: CurrencyCode,
    nullable: true,
    description: 'The currency of the invoice',
  })
  @IsString()
  @IsOptional()
  currency?: CurrencyCode;

  @ApiPropertyOptional({
    type: String,
    example: '1.2',
    nullable: true,
    description: 'The exchange rate applied to the invoice',
  })
  @IsString()
  @IsOptional()
  exchange_rate?: string;

  @ApiPropertyOptional({
    type: Number,
    example: 1000,
    nullable: true,
    description: 'The total discount applied to the invoice',
  })
  @IsNumber()
  @IsOptional()
  total_discount?: number;

  @ApiPropertyOptional({
    type: Number,
    example: 10000,
    nullable: true,
    description: 'The subtotal of the invoice',
  })
  @IsNumber()
  @IsOptional()
  sub_total?: number;

  @ApiPropertyOptional({
    type: String,
    example: 'Paid',
    nullable: true,
    description: 'The status of the invoice',
  })
  @IsString()
  @IsOptional()
  status?: string;

  @ApiPropertyOptional({
    type: Number,
    example: 1000,
    nullable: true,
    description: 'The total tax amount on the invoice',
  })
  @IsNumber()
  @IsOptional()
  total_tax_amount?: number;

  @ApiPropertyOptional({
    type: Number,
    example: 11000,
    nullable: true,
    description: 'The total amount of the invoice',
  })
  @IsNumber()
  @IsOptional()
  total_amount?: number;

  @ApiPropertyOptional({
    type: Number,
    example: 0,
    nullable: true,
    description: 'The remaining balance on the invoice',
  })
  @IsNumber()
  @IsOptional()
  balance?: number;

  @ApiPropertyOptional({
    type: String,
    example: '801f9ede-c698-4e66-a7fc-48d19eebaa4f',
    nullable: true,
    description: 'The UUID of the associated contact',
  })
  @IsUUID()
  @IsOptional()
  contact_id?: string;

  @ApiPropertyOptional({
    type: String,
    example: '801f9ede-c698-4e66-a7fc-48d19eebaa4f',
    nullable: true,
    description: 'The UUID of the associated accounting period',
  })
  @IsUUID()
  @IsOptional()
  accounting_period_id?: string; // todo

  @ApiPropertyOptional({
    type: [String],
    example: [
      '801f9ede-c698-4e66-a7fc-48d19eebaa4f',
      '801f9ede-c698-4e66-a7fc-48d19eebaa4f',
    ],
    nullable: true,
    description:
      'The UUIDs of the tracking categories associated with the invoice',
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tracking_categories?: string[];

  @ApiPropertyOptional({
    type: [LineItem],
    description: 'The line items associated with this invoice',
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

export class UnifiedAccountingInvoiceOutput extends UnifiedAccountingInvoiceInput {
  @ApiPropertyOptional({
    type: String,
    example: '801f9ede-c698-4e66-a7fc-48d19eebaa4f',
    nullable: true,
    description: 'The UUID of the invoice record',
  })
  @IsUUID()
  @IsOptional()
  id?: string;

  @ApiPropertyOptional({
    type: String,
    example: 'invoice_1234',
    nullable: true,
    description: 'The remote ID of the invoice in the context of the 3rd Party',
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
      'The remote data of the invoice in the context of the 3rd Party',
  })
  @IsOptional()
  remote_data?: Record<string, any>;

  @ApiPropertyOptional({
    type: Date,
    example: '2024-06-15T12:00:00Z',
    nullable: true,
    description:
      'The date when the invoice was last updated in the remote system',
  })
  @IsDateString()
  @IsOptional()
  remote_updated_at?: Date;

  @ApiPropertyOptional({
    type: Date,
    example: '2024-06-15T12:00:00Z',
    nullable: true,
    description: 'The created date of the invoice record',
  })
  @IsDateString()
  @IsOptional()
  created_at?: Date;

  @ApiPropertyOptional({
    type: Date,
    example: '2024-06-15T12:00:00Z',
    nullable: true,
    description: 'The last modified date of the invoice record',
  })
  @IsDateString()
  @IsOptional()
  modified_at?: Date;
}
