import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsUUID,
  IsOptional,
  IsString,
  IsDateString,
  IsBoolean,
} from 'class-validator';

export type RunState = 'PAID' | 'DRAFT' | 'APPROVED' | 'FAILED' | 'CLOSE';
export type RunType =
  | 'REGULAR'
  | 'OFF_CYCLE'
  | 'CORRECTION'
  | 'TERMINATION'
  | 'SIGN_ON_BONUS';
export class UnifiedHrisPayrollrunInput {
  @ApiPropertyOptional({
    type: String,
    example: 'PAID',
    enum: ['PAID', 'DRAFT', 'APPROVED', 'FAILED', 'CLOSE'],
    nullable: true,
    description: 'The state of the payroll run',
  })
  @IsString()
  @IsOptional()
  run_state?: RunState | string;

  @ApiPropertyOptional({
    type: String,
    example: 'REGULAR',
    enum: [
      'REGULAR',
      'OFF_CYCLE',
      'CORRECTION',
      'TERMINATION',
      'SIGN_ON_BONUS',
    ],
    nullable: true,
    description: 'The type of the payroll run',
  })
  @IsString()
  @IsOptional()
  run_type?: RunType | string;

  @ApiPropertyOptional({
    type: Date,
    example: '2024-01-01T00:00:00Z',
    nullable: true,
    description: 'The start date of the payroll run',
  })
  @IsDateString()
  @IsOptional()
  start_date?: Date;

  @ApiPropertyOptional({
    type: Date,
    example: '2024-01-15T23:59:59Z',
    nullable: true,
    description: 'The end date of the payroll run',
  })
  @IsDateString()
  @IsOptional()
  end_date?: Date;

  @ApiPropertyOptional({
    type: Date,
    example: '2024-01-20T00:00:00Z',
    nullable: true,
    description: 'The check date of the payroll run',
  })
  @IsDateString()
  @IsOptional()
  check_date?: Date;

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

export class UnifiedHrisPayrollrunOutput extends UnifiedHrisPayrollrunInput {
  @ApiPropertyOptional({
    type: String,
    example: '801f9ede-c698-4e66-a7fc-48d19eebaa4f',
    nullable: true,
    description: 'The UUID of the payroll run record',
  })
  @IsUUID()
  @IsOptional()
  id?: string;

  @ApiPropertyOptional({
    type: String,
    example: 'payroll_run_1234',
    nullable: true,
    description:
      'The remote ID of the payroll run in the context of the 3rd Party',
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
      'The remote data of the payroll run in the context of the 3rd Party',
  })
  @IsOptional()
  remote_data?: Record<string, any>;

  @ApiPropertyOptional({
    type: Date,
    example: '2024-10-01T12:00:00Z',
    nullable: true,
    description:
      'The date when the payroll run was created in the 3rd party system',
  })
  @IsDateString()
  @IsOptional()
  remote_created_at?: Date;

  @ApiPropertyOptional({
    type: Date,
    example: '2024-10-01T12:00:00Z',
    nullable: true,
    description: 'The created date of the payroll run record',
  })
  @IsDateString()
  @IsOptional()
  created_at?: Date;

  @ApiPropertyOptional({
    type: Date,
    example: '2024-10-01T12:00:00Z',
    nullable: true,
    description: 'The last modified date of the payroll run record',
  })
  @IsDateString()
  @IsOptional()
  modified_at?: Date;

  @ApiPropertyOptional({
    type: Boolean,
    example: false,
    nullable: true,
    description:
      'Indicates if the payroll run was deleted in the remote system',
  })
  @IsBoolean()
  @IsOptional()
  remote_was_deleted?: boolean;

  @ApiPropertyOptional({
    type: [String],
    example: ['801f9ede-c698-4e66-a7fc-48d19eebaa4f'],
    nullable: true,
    description:
      'The UUIDs of the employee payroll runs associated with this payroll run',
  })
  @IsOptional()
  employee_payroll_runs?: string[];
}
