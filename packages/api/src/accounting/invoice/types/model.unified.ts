import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsUUID,
  IsOptional,
  IsString,
  IsNumber,
  IsDateString,
  IsArray,
} from 'class-validator';

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
    type: String,
    example: '2024-06-15T12:00:00Z',
    nullable: true,
    description: 'The date the invoice was issued',
  })
  @IsDateString()
  @IsOptional()
  issue_date?: string;

  @ApiPropertyOptional({
    type: String,
    example: '2024-07-15T12:00:00Z',
    nullable: true,
    description: 'The due date of the invoice',
  })
  @IsDateString()
  @IsOptional()
  due_date?: string;

  @ApiPropertyOptional({
    type: String,
    example: '2024-07-10T12:00:00Z',
    nullable: true,
    description: 'The date the invoice was paid',
  })
  @IsDateString()
  @IsOptional()
  paid_on_date?: string;

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
    nullable: true,
    description: 'The currency of the invoice',
  })
  @IsString()
  @IsOptional()
  currency?: string;

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
  accounting_period_id?: string;

  @ApiPropertyOptional({
    type: [String],
    example: ['Project A', 'Department B'],
    nullable: true,
    description: 'The tracking categories associated with the invoice',
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tracking_categories?: string[];

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
    type: String,
    example: '2024-06-15T12:00:00Z',
    nullable: true,
    description:
      'The date when the invoice was last updated in the remote system',
  })
  @IsDateString()
  @IsOptional()
  remote_updated_at?: string;

  @ApiPropertyOptional({
    type: String,
    example: '2024-06-15T12:00:00Z',
    nullable: true,
    description: 'The created date of the invoice record',
  })
  @IsDateString()
  @IsOptional()
  created_at?: string;

  @ApiPropertyOptional({
    type: String,
    example: '2024-06-15T12:00:00Z',
    nullable: true,
    description: 'The last modified date of the invoice record',
  })
  @IsDateString()
  @IsOptional()
  modified_at?: string;
}
