import { CurrencyCode } from '@@core/utils/types';
import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsUUID,
  IsOptional,
  IsString,
  IsNumber,
  IsDateString,
} from 'class-validator';

export class UnifiedAccountingIncomestatementInput {
  @ApiPropertyOptional({
    type: String,
    example: 'Q2 2024 Income Statement',
    nullable: true,
    description: 'The name of the income statement',
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({
    type: String,
    example: 'USD',
    // enum: CurrencyCode,
    nullable: true,
    description: 'The currency used in the income statement',
  })
  @IsString()
  @IsOptional()
  currency?: CurrencyCode;

  @ApiPropertyOptional({
    type: Date,
    example: '2024-04-01T00:00:00Z',
    nullable: true,
    description: 'The start date of the period covered by the income statement',
  })
  @IsDateString()
  @IsOptional()
  start_period?: Date;

  @ApiPropertyOptional({
    type: Date,
    example: '2024-06-30T23:59:59Z',
    nullable: true,
    description: 'The end date of the period covered by the income statement',
  })
  @IsDateString()
  @IsOptional()
  end_period?: Date;

  @ApiPropertyOptional({
    type: Number,
    example: 1000000,
    nullable: true,
    description: 'The gross profit for the period',
  })
  @IsNumber()
  @IsOptional()
  gross_profit?: number;

  @ApiPropertyOptional({
    type: Number,
    example: 800000,
    nullable: true,
    description: 'The net operating income for the period',
  })
  @IsNumber()
  @IsOptional()
  net_operating_income?: number;

  @ApiPropertyOptional({
    type: Number,
    example: 750000,
    nullable: true,
    description: 'The net income for the period',
  })
  @IsNumber()
  @IsOptional()
  net_income?: number;

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

export class UnifiedAccountingIncomestatementOutput extends UnifiedAccountingIncomestatementInput {
  @ApiPropertyOptional({
    type: String,
    example: '801f9ede-c698-4e66-a7fc-48d19eebaa4f',
    nullable: true,
    description: 'The UUID of the income statement record',
  })
  @IsUUID()
  @IsOptional()
  id?: string;

  @ApiPropertyOptional({
    type: String,
    example: 'incomestatement_1234',
    nullable: true,
    description:
      'The remote ID of the income statement in the context of the 3rd Party',
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
      'The remote data of the income statement in the context of the 3rd Party',
  })
  @IsOptional()
  remote_data?: Record<string, any>;

  @ApiPropertyOptional({
    type: Date,
    example: '2024-06-15T12:00:00Z',
    nullable: true,
    description: 'The created date of the income statement record',
  })
  @IsDateString()
  @IsOptional()
  created_at?: Date;

  @ApiPropertyOptional({
    type: Date,
    example: '2024-06-15T12:00:00Z',
    nullable: true,
    description: 'The last modified date of the income statement record',
  })
  @IsDateString()
  @IsOptional()
  modified_at?: Date;
}
