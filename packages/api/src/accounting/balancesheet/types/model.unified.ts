import { CurrencyCode } from '@@core/utils/types';
import { LineItem } from '@accounting/cashflowstatement/types/model.unified';
import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsUUID,
  IsOptional,
  IsString,
  IsNumber,
  IsDateString,
  IsArray,
} from 'class-validator';

// todo balance sheet report items ?
export class UnifiedAccountingBalancesheetInput {
  @ApiPropertyOptional({
    type: String,
    example: 'Q2 2024 Balance Sheet',
    nullable: true,
    description: 'The name of the balance sheet',
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({
    type: String,
    example: 'USD',
    // enum: CurrencyCode,
    nullable: true,
    description: 'The currency used in the balance sheet',
  })
  @IsString()
  @IsOptional()
  currency?: CurrencyCode;

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
    type: Date,
    example: '2024-06-30T23:59:59Z',
    nullable: true,
    description: 'The date of the balance sheet',
  })
  @IsDateString()
  @IsOptional()
  date?: Date;

  @ApiPropertyOptional({
    type: Number,
    example: 1000000,
    nullable: true,
    description: 'The net assets value',
  })
  @IsNumber()
  @IsOptional()
  net_assets?: number;

  @ApiPropertyOptional({
    type: [String],
    example: ['Cash', 'Accounts Receivable', 'Inventory'],
    nullable: true,
    description: 'The list of assets',
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  assets?: string[];

  @ApiPropertyOptional({
    type: [String],
    example: ['Accounts Payable', 'Long-term Debt'],
    nullable: true,
    description: 'The list of liabilities',
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  liabilities?: string[];

  @ApiPropertyOptional({
    type: [String],
    example: ['Common Stock', 'Retained Earnings'],
    nullable: true,
    description: 'The list of equity items',
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  equity?: string[];

  @ApiPropertyOptional({
    type: Date,
    example: '2024-07-01T12:00:00Z',
    nullable: true,
    description:
      'The date when the balance sheet was generated in the remote system',
  })
  @IsDateString()
  @IsOptional()
  remote_generated_at?: Date;

  @ApiPropertyOptional({
    type: [LineItem],
    description: 'The report items associated with this balance sheet',
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

export class UnifiedAccountingBalancesheetOutput extends UnifiedAccountingBalancesheetInput {
  @ApiPropertyOptional({
    type: String,
    example: '801f9ede-c698-4e66-a7fc-48d19eebaa4f',
    nullable: true,
    description: 'The UUID of the balance sheet record',
  })
  @IsUUID()
  @IsOptional()
  id?: string;

  @ApiPropertyOptional({
    type: String,
    example: 'balancesheet_1234',
    nullable: true,
    description:
      'The remote ID of the balance sheet in the context of the 3rd Party',
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
      'The remote data of the balance sheet in the context of the 3rd Party',
  })
  @IsOptional()
  remote_data?: Record<string, any>;

  @ApiPropertyOptional({
    type: Date,
    example: '2024-06-15T12:00:00Z',
    nullable: true,
    description: 'The created date of the balance sheet record',
  })
  @IsDateString()
  @IsOptional()
  created_at?: Date;

  @ApiPropertyOptional({
    type: Date,
    example: '2024-06-15T12:00:00Z',
    nullable: true,
    description: 'The last modified date of the balance sheet record',
  })
  @IsDateString()
  @IsOptional()
  modified_at?: Date;
}
