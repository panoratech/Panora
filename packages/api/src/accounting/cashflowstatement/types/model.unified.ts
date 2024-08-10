import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsUUID,
  IsOptional,
  IsString,
  IsNumber,
  IsDateString,
} from 'class-validator';

// todo cashflow statement report items
export class UnifiedAccountingCashflowstatementInput {
  @ApiPropertyOptional({
    type: String,
    example: 'Q2 2024 Cash Flow Statement',
    nullable: true,
    description: 'The name of the cash flow statement',
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({
    type: String,
    example: 'USD',
    nullable: true,
    description: 'The currency used in the cash flow statement',
  })
  @IsString()
  @IsOptional()
  currency?: string;

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
    example: '2024-04-01T00:00:00Z',
    nullable: true,
    description:
      'The start date of the period covered by the cash flow statement',
  })
  @IsDateString()
  @IsOptional()
  start_period?: string;

  @ApiPropertyOptional({
    type: String,
    example: '2024-06-30T23:59:59Z',
    nullable: true,
    description:
      'The end date of the period covered by the cash flow statement',
  })
  @IsDateString()
  @IsOptional()
  end_period?: string;

  @ApiPropertyOptional({
    type: Number,
    example: 1000000,
    nullable: true,
    description: 'The cash balance at the beginning of the period',
  })
  @IsNumber()
  @IsOptional()
  cash_at_beginning_of_period?: number;

  @ApiPropertyOptional({
    type: Number,
    example: 1200000,
    nullable: true,
    description: 'The cash balance at the end of the period',
  })
  @IsNumber()
  @IsOptional()
  cash_at_end_of_period?: number;

  @ApiPropertyOptional({
    type: String,
    example: '2024-07-01T12:00:00Z',
    nullable: true,
    description:
      'The date when the cash flow statement was generated in the remote system',
  })
  @IsDateString()
  @IsOptional()
  remote_generated_at?: string;

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

export class UnifiedAccountingCashflowstatementOutput extends UnifiedAccountingCashflowstatementInput {
  @ApiPropertyOptional({
    type: String,
    example: '801f9ede-c698-4e66-a7fc-48d19eebaa4f',
    nullable: true,
    description: 'The UUID of the cash flow statement record',
  })
  @IsUUID()
  @IsOptional()
  id?: string;

  @ApiPropertyOptional({
    type: String,
    example: 'cashflowstatement_1234',
    nullable: true,
    description:
      'The remote ID of the cash flow statement in the context of the 3rd Party',
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
      'The remote data of the cash flow statement in the context of the 3rd Party',
  })
  @IsOptional()
  remote_data?: Record<string, any>;

  @ApiPropertyOptional({
    type: String,
    example: '2024-06-15T12:00:00Z',
    nullable: true,
    description: 'The created date of the cash flow statement record',
  })
  @IsDateString()
  @IsOptional()
  created_at?: string;

  @ApiPropertyOptional({
    type: String,
    example: '2024-06-15T12:00:00Z',
    nullable: true,
    description: 'The last modified date of the cash flow statement record',
  })
  @IsDateString()
  @IsOptional()
  modified_at?: string;
}
