import { CurrencyCode } from '@@core/utils/types';
import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsUUID,
  IsString,
  IsDateString,
  IsArray,
  IsOptional,
  IsNumber,
} from 'class-validator';

export class LineItem {
  @ApiPropertyOptional({
    type: Number,
    example: 10000,
    nullable: true,
    description: 'The net amount of the line item in cents',
  })
  @IsNumber()
  @IsOptional()
  net_amount?: number;

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
    example: 'Office supplies expense',
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
    description: 'The UUID of the associated company',
  })
  @IsUUID()
  @IsOptional()
  company?: string;

  @ApiPropertyOptional({
    type: String,
    example: '801f9ede-c698-4e66-a7fc-48d19eebaa4f',
    nullable: true,
    description: 'The UUID of the associated contact',
  })
  @IsUUID()
  @IsOptional()
  contact?: string;

  @ApiPropertyOptional({
    type: String,
    example: '1.2',
    nullable: true,
    description: 'The exchange rate applied to the line item',
  })
  @IsString()
  @IsOptional()
  exchange_rate?: string;

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

export class UnifiedAccountingJournalentryInput {
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
    type: [String],
    example: ['payment1', 'payment2'],
    nullable: true,
    description: 'The payments associated with the journal entry',
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  payments?: string[];

  @ApiPropertyOptional({
    type: [String],
    example: ['appliedPayment1', 'appliedPayment2'],
    nullable: true,
    description: 'The applied payments for the journal entry',
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  applied_payments?: string[];

  @ApiPropertyOptional({
    type: String,
    example: 'Monthly expense journal entry',
    nullable: true,
    description: 'A memo or note for the journal entry',
  })
  @IsString()
  @IsOptional()
  memo?: string;

  @ApiPropertyOptional({
    type: String,
    example: 'USD',
    // enum: CurrencyCode,
    nullable: true,
    description: 'The currency of the journal entry',
  })
  @IsString()
  @IsOptional()
  currency?: CurrencyCode;

  @ApiPropertyOptional({
    type: String,
    example: '1.2',
    nullable: true,
    description: 'The exchange rate applied to the journal entry',
  })
  @IsString()
  @IsOptional()
  exchange_rate?: string;

  @ApiPropertyOptional({
    type: String,
    example: '801f9ede-c698-4e66-a7fc-48d19eebaa4f',
    nullable: false,
    description: 'The UUID of the associated company info',
  })
  @IsUUID()
  id_acc_company_info: string;

  @ApiPropertyOptional({
    type: String,
    example: 'JE-001',
    nullable: true,
    description: 'The journal number',
  })
  @IsString()
  @IsOptional()
  journal_number?: string;

  @ApiPropertyOptional({
    type: [String],
    example: ['801f9ede-c698-4e66-a7fc-48d19eebaa4f'],
    nullable: true,
    description:
      'The UUIDs of the tracking categories associated with the journal entry',
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
  id_acc_accounting_period?: string;

  @ApiPropertyOptional({
    type: String,
    example: 'Posted',
    nullable: true,
    description: 'The posting status of the journal entry',
  })
  @IsString()
  @IsOptional()
  posting_status?: string;

  @ApiPropertyOptional({
    type: [LineItem],
    description: 'The line items associated with this journal entry',
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

export class UnifiedAccountingJournalentryOutput extends UnifiedAccountingJournalentryInput {
  @ApiPropertyOptional({
    type: String,
    example: '801f9ede-c698-4e66-a7fc-48d19eebaa4f',
    nullable: true,
    description: 'The UUID of the journal entry record',
  })
  @IsUUID()
  @IsOptional()
  id?: string;

  @ApiPropertyOptional({
    type: String,
    example: 'journal_entry_1234',
    nullable: false,
    description:
      'The remote ID of the journal entry in the context of the 3rd Party',
  })
  @IsString()
  remote_id: string;

  @ApiPropertyOptional({
    type: Date,
    example: '2024-06-15T12:00:00Z',
    nullable: true,
    description:
      'The date when the journal entry was created in the remote system',
  })
  @IsDateString()
  @IsOptional()
  remote_created_at?: Date;

  @ApiPropertyOptional({
    type: Date,
    example: '2024-06-15T12:00:00Z',
    nullable: true,
    description:
      'The date when the journal entry was last modified in the remote system',
  })
  @IsDateString()
  @IsOptional()
  remote_modiified_at?: Date;

  @ApiPropertyOptional({
    type: Object,
    example: {
      raw_data: {
        additional_field: 'some value',
      },
    },
    nullable: true,
    description:
      'The remote data of the journal entry in the context of the 3rd Party',
  })
  @IsOptional()
  remote_data?: Record<string, any>;

  @ApiPropertyOptional({
    type: Date,
    example: '2024-06-15T12:00:00Z',
    nullable: true,
    description: 'The created date of the journal entry record',
  })
  @IsDateString()
  @IsOptional()
  created_at?: Date;

  @ApiPropertyOptional({
    type: Date,
    example: '2024-06-15T12:00:00Z',
    nullable: true,
    description: 'The last modified date of the journal entry record',
  })
  @IsDateString()
  @IsOptional()
  modified_at?: Date;
}
