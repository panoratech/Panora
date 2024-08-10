import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsUUID,
  IsOptional,
  IsString,
  IsNumber,
  IsDateString,
  IsBoolean,
  IsArray,
} from 'class-validator';

class DeductionItem {
  @ApiPropertyOptional({
    type: String,
    example: 'Health Insurance',
    nullable: true,
    description: 'The name of the deduction',
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({
    type: Number,
    example: 100,
    nullable: true,
    description: 'The amount of employee deduction',
  })
  @IsNumber()
  @IsOptional()
  employee_deduction?: number;

  @ApiPropertyOptional({
    type: Number,
    example: 200,
    nullable: true,
    description: 'The amount of company deduction',
  })
  @IsNumber()
  @IsOptional()
  company_deduction?: number;
}

class EarningItem {
  @ApiPropertyOptional({
    type: Number,
    example: 1000,
    nullable: true,
    description: 'The amount of the earning',
  })
  @IsNumber()
  @IsOptional()
  amount?: number;

  @ApiPropertyOptional({
    type: String,
    example: 'Salary',
    nullable: true,
    description: 'The type of the earning',
  })
  @IsString()
  @IsOptional()
  type?: string;
}

class TaxItem {
  @ApiPropertyOptional({
    type: String,
    example: 'Federal Income Tax',
    nullable: true,
    description: 'The name of the tax',
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({
    type: Number,
    example: 250,
    nullable: true,
    description: 'The amount of the tax',
  })
  @IsNumber()
  @IsOptional()
  amount?: number;

  @ApiPropertyOptional({
    type: Boolean,
    example: true,
    nullable: true,
    description: 'Indicates if this is an employer tax',
  })
  @IsBoolean()
  @IsOptional()
  employer_tax?: boolean;
}

export class UnifiedHrisEmployeepayrollrunInput {
  @ApiPropertyOptional({
    type: String,
    example: '801f9ede-c698-4e66-a7fc-48d19eebaa4f',
    nullable: true,
    description: 'The UUID of the associated employee',
  })
  @IsUUID()
  @IsOptional()
  employee_id?: string;

  @ApiPropertyOptional({
    type: String,
    example: '801f9ede-c698-4e66-a7fc-48d19eebaa4f',
    nullable: true,
    description: 'The UUID of the associated payroll run',
  })
  @IsUUID()
  @IsOptional()
  payroll_run_id?: string;

  @ApiPropertyOptional({
    type: Number,
    example: 5000,
    nullable: true,
    description: 'The gross pay amount',
  })
  @IsNumber()
  @IsOptional()
  gross_pay?: number;

  @ApiPropertyOptional({
    type: Number,
    example: 4000,
    nullable: true,
    description: 'The net pay amount',
  })
  @IsNumber()
  @IsOptional()
  net_pay?: number;

  @ApiPropertyOptional({
    type: String,
    example: '2023-01-01T00:00:00Z',
    nullable: true,
    description: 'The start date of the pay period',
  })
  @IsDateString()
  @IsOptional()
  start_date?: string;

  @ApiPropertyOptional({
    type: String,
    example: '2023-01-15T23:59:59Z',
    nullable: true,
    description: 'The end date of the pay period',
  })
  @IsDateString()
  @IsOptional()
  end_date?: string;

  @ApiPropertyOptional({
    type: String,
    example: '2023-01-20T00:00:00Z',
    nullable: true,
    description: 'The date the check was issued',
  })
  @IsDateString()
  @IsOptional()
  check_date?: string;

  @ApiPropertyOptional({
    type: [DeductionItem],
    nullable: true,
    description: 'The list of deductions for this payroll run',
  })
  @IsArray()
  @IsOptional()
  deductions?: DeductionItem[];

  @ApiPropertyOptional({
    type: [EarningItem],
    nullable: true,
    description: 'The list of earnings for this payroll run',
  })
  @IsArray()
  @IsOptional()
  earnings?: EarningItem[];

  @ApiPropertyOptional({
    type: [TaxItem],
    nullable: true,
    description: 'The list of taxes for this payroll run',
  })
  @IsArray()
  @IsOptional()
  taxes?: TaxItem[];

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

export class UnifiedHrisEmployeepayrollrunOutput extends UnifiedHrisEmployeepayrollrunInput {
  @ApiPropertyOptional({
    type: String,
    example: '801f9ede-c698-4e66-a7fc-48d19eebaa4f',
    nullable: true,
    description: 'The UUID of the employee payroll run record',
  })
  @IsUUID()
  @IsOptional()
  id?: string;

  @ApiPropertyOptional({
    type: String,
    example: 'payroll_run_1234',
    nullable: true,
    description:
      'The remote ID of the employee payroll run in the context of the 3rd Party',
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
      'The remote data of the employee payroll run in the context of the 3rd Party',
  })
  @IsOptional()
  remote_data?: Record<string, any>;

  @ApiPropertyOptional({
    type: String,
    example: '2024-10-01T12:00:00Z',
    nullable: true,
    description:
      'The date when the employee payroll run was created in the 3rd party system',
  })
  @IsDateString()
  @IsOptional()
  remote_created_at?: string;

  @ApiPropertyOptional({
    type: String,
    example: '2024-10-01T12:00:00Z',
    nullable: true,
    description: 'The created date of the employee payroll run record',
  })
  @IsDateString()
  @IsOptional()
  created_at?: string;

  @ApiPropertyOptional({
    type: String,
    example: '2024-10-01T12:00:00Z',
    nullable: true,
    description: 'The last modified date of the employee payroll run record',
  })
  @IsDateString()
  @IsOptional()
  modified_at?: string;

  @ApiPropertyOptional({
    type: Boolean,
    example: false,
    nullable: true,
    description:
      'Indicates if the employee payroll run was deleted in the remote system',
  })
  @IsBoolean()
  @IsOptional()
  remote_was_deleted?: boolean;
}
