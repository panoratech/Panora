import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsUUID,
  IsOptional,
  IsString,
  IsNumber,
  IsDateString,
  IsArray,
} from 'class-validator';

// todo: expense line
export class UnifiedAccountingExpenseInput {
  @ApiPropertyOptional({
    type: String,
    example: '2024-06-15T12:00:00Z',
    nullable: true,
    description: 'The date of the expense transaction',
  })
  @IsDateString()
  @IsOptional()
  transaction_date?: string;

  @ApiPropertyOptional({
    type: Number,
    example: 10000,
    nullable: true,
    description: 'The total amount of the expense',
  })
  @IsNumber()
  @IsOptional()
  total_amount?: number;

  @ApiPropertyOptional({
    type: Number,
    example: 9000,
    nullable: true,
    description: 'The sub-total amount of the expense (before tax)',
  })
  @IsNumber()
  @IsOptional()
  sub_total?: number;

  @ApiPropertyOptional({
    type: Number,
    example: 1000,
    nullable: true,
    description: 'The total tax amount of the expense',
  })
  @IsNumber()
  @IsOptional()
  total_tax_amount?: number;

  @ApiPropertyOptional({
    type: String,
    example: 'USD',
    nullable: true,
    description: 'The currency of the expense',
  })
  @IsString()
  @IsOptional()
  currency?: string;

  @ApiPropertyOptional({
    type: String,
    example: '1.2',
    nullable: true,
    description: 'The exchange rate applied to the expense',
  })
  @IsString()
  @IsOptional()
  exchange_rate?: string;

  @ApiPropertyOptional({
    type: String,
    example: 'Business lunch with client',
    nullable: true,
    description: 'A memo or description for the expense',
  })
  @IsString()
  @IsOptional()
  memo?: string;

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
    description: 'The UUID of the associated contact',
  })
  @IsUUID()
  @IsOptional()
  contact_id?: string;

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
    type: [String],
    example: ['Project A', 'Department B'],
    nullable: true,
    description: 'The tracking categories associated with the expense',
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

export class UnifiedAccountingExpenseOutput extends UnifiedAccountingExpenseInput {
  @ApiPropertyOptional({
    type: String,
    example: '801f9ede-c698-4e66-a7fc-48d19eebaa4f',
    nullable: true,
    description: 'The UUID of the expense record',
  })
  @IsUUID()
  @IsOptional()
  id?: string;

  @ApiPropertyOptional({
    type: String,
    example: 'expense_1234',
    nullable: true,
    description: 'The remote ID of the expense in the context of the 3rd Party',
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
      'The remote data of the expense in the context of the 3rd Party',
  })
  @IsOptional()
  remote_data?: Record<string, any>;

  @ApiPropertyOptional({
    type: String,
    example: '2024-06-15T12:00:00Z',
    nullable: true,
    description: 'The date when the expense was created in the remote system',
  })
  @IsDateString()
  @IsOptional()
  remote_created_at?: string;

  @ApiPropertyOptional({
    type: String,
    example: '2024-06-15T12:00:00Z',
    nullable: true,
    description: 'The created date of the expense record',
  })
  @IsDateString()
  @IsOptional()
  created_at?: string;

  @ApiPropertyOptional({
    type: String,
    example: '2024-06-15T12:00:00Z',
    nullable: true,
    description: 'The last modified date of the expense record',
  })
  @IsDateString()
  @IsOptional()
  modified_at?: string;
}
