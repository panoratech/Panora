import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsUUID,
  IsOptional,
  IsString,
  IsDateString,
  IsBoolean,
  IsNumber,
} from 'class-validator';

export class UnifiedHrisTimesheetEntryInput {
  @ApiPropertyOptional({
    type: Number,
    example: 40,
    nullable: true,
    description: 'The number of hours worked',
  })
  @IsNumber()
  @IsOptional()
  hours_worked?: number;

  @ApiPropertyOptional({
    type: Date,
    example: '2024-10-01T08:00:00Z',
    nullable: true,
    description: 'The start time of the timesheet entry',
  })
  @IsOptional()
  start_time?: Date;

  @ApiPropertyOptional({
    type: Date,
    example: '2024-10-01T16:00:00Z',
    nullable: true,
    description: 'The end time of the timesheet entry',
  })
  @IsOptional()
  end_time?: Date;

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
    type: Boolean,
    example: false,
    description:
      'Indicates if the timesheet entry was deleted in the remote system',
  })
  @IsBoolean()
  @IsOptional()
  remote_was_deleted?: boolean;

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

export class UnifiedHrisTimesheetEntryOutput extends UnifiedHrisTimesheetEntryInput {
  @ApiPropertyOptional({
    type: String,
    example: '801f9ede-c698-4e66-a7fc-48d19eebaa4f',
    nullable: true,
    description: 'The UUID of the timesheet entry record',
  })
  @IsUUID()
  @IsOptional()
  id?: string;

  @ApiPropertyOptional({
    type: String,
    example: 'id_1',
    nullable: true,
    description: 'The remote ID of the timesheet entry',
  })
  @IsString()
  @IsOptional()
  remote_id?: string;

  @ApiPropertyOptional({
    type: Date,
    example: '2024-10-01T12:00:00Z',
    nullable: true,
    description:
      'The date when the timesheet entry was created in the remote system',
  })
  @IsDateString()
  @IsOptional()
  remote_created_at?: Date;

  @ApiPropertyOptional({
    type: Date,
    example: '2024-10-01T12:00:00Z',
    description: 'The created date of the timesheet entry',
  })
  @IsDateString()
  @IsOptional()
  created_at?: Date;

  @ApiPropertyOptional({
    type: Date,
    example: '2024-10-01T12:00:00Z',
    description: 'The last modified date of the timesheet entry',
  })
  @IsDateString()
  @IsOptional()
  modified_at?: Date;

  @ApiPropertyOptional({
    type: Object,
    example: {
      raw_data: {
        additional_field: 'some value',
      },
    },
    nullable: true,
    description:
      'The remote data of the timesheet entry in the context of the 3rd Party',
  })
  @IsOptional()
  remote_data?: Record<string, any>;
}
