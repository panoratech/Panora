import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsUUID,
  IsOptional,
  IsString,
  IsNumber,
  IsDateString,
  IsBoolean,
} from 'class-validator';

export type Status =
  | 'REQUESTED'
  | 'APPROVED'
  | 'DECLINED'
  | 'CANCELLED'
  | 'DELETED';

export type RequestType =
  | 'VACATION'
  | 'SICK'
  | 'PERSONAL'
  | 'JURY_DUTY'
  | 'VOLUNTEER'
  | 'BEREAVEMENT';
export class UnifiedHrisTimeoffInput {
  @ApiPropertyOptional({
    type: String,
    example: '801f9ede-c698-4e66-a7fc-48d19eebaa4f',
    nullable: true,
    description: 'The UUID of the employee taking time off',
  })
  @IsUUID()
  @IsOptional()
  employee?: string;

  @ApiPropertyOptional({
    type: String,
    example: '801f9ede-c698-4e66-a7fc-48d19eebaa4f',
    nullable: true,
    description: 'The UUID of the approver for the time off request',
  })
  @IsUUID()
  @IsOptional()
  approver?: string;

  @ApiPropertyOptional({
    type: String,
    example: 'REQUESTED',
    // enum: ['REQUESTED', 'APPROVED', 'DECLINED', 'CANCELLED', 'DELETED'],
    nullable: true,
    description: 'The status of the time off request',
  })
  @IsString()
  @IsOptional()
  status?: Status | string;

  @ApiPropertyOptional({
    type: String,
    example: 'Annual vacation',
    nullable: true,
    description: 'A note from the employee about the time off request',
  })
  @IsString()
  @IsOptional()
  employee_note?: string;

  @ApiPropertyOptional({
    type: String,
    example: 'DAYS',
    // enum: ['HOURS', 'DAYS'],
    nullable: true,
    description: 'The units used for the time off (e.g., Days, Hours)',
  })
  @IsString()
  @IsOptional()
  units?: 'HOURS' | 'DAYS' | string;

  @ApiPropertyOptional({
    type: Number,
    example: 5,
    nullable: true,
    description: 'The amount of time off requested',
  })
  @IsNumber()
  @IsOptional()
  amount?: number;

  @ApiPropertyOptional({
    type: String,
    example: 'VACATION',
    /* enum: [
      'VACATION',
      'SICK',
      'PERSONAL',
      'JURY_DUTY',
      'VOLUNTEER',
      'BEREAVEMENT',
    ],*/
    nullable: true,
    description: 'The type of time off request',
  })
  @IsString()
  @IsOptional()
  request_type?: RequestType | string;

  @ApiPropertyOptional({
    type: Date,
    example: '2024-07-01T09:00:00Z',
    nullable: true,
    description: 'The start time of the time off',
  })
  @IsDateString()
  @IsOptional()
  start_time?: Date;

  @ApiPropertyOptional({
    type: Date,
    example: '2024-07-05T17:00:00Z',
    nullable: true,
    description: 'The end time of the time off',
  })
  @IsDateString()
  @IsOptional()
  end_time?: Date;

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

export class UnifiedHrisTimeoffOutput extends UnifiedHrisTimeoffInput {
  @ApiPropertyOptional({
    type: String,
    example: '801f9ede-c698-4e66-a7fc-48d19eebaa4f',
    nullable: true,
    description: 'The UUID of the time off record',
  })
  @IsUUID()
  @IsOptional()
  id?: string;

  @ApiPropertyOptional({
    type: String,
    example: 'timeoff_1234',
    nullable: true,
    description:
      'The remote ID of the time off in the context of the 3rd Party',
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
      'The remote data of the time off in the context of the 3rd Party',
  })
  @IsOptional()
  remote_data?: Record<string, any>;

  @ApiPropertyOptional({
    type: Date,
    example: '2024-06-15T12:00:00Z',
    nullable: true,
    description:
      'The date when the time off was created in the 3rd party system',
  })
  @IsDateString()
  @IsOptional()
  remote_created_at?: Date;

  @ApiPropertyOptional({
    type: Date,
    example: '2024-06-15T12:00:00Z',
    nullable: true,
    description: 'The created date of the time off record',
  })
  @IsDateString()
  @IsOptional()
  created_at?: Date;

  @ApiPropertyOptional({
    type: Date,
    example: '2024-06-15T12:00:00Z',
    nullable: true,
    description: 'The last modified date of the time off record',
  })
  @IsDateString()
  @IsOptional()
  modified_at?: Date;

  @ApiPropertyOptional({
    type: Boolean,
    example: false,
    nullable: true,
    description: 'Indicates if the time off was deleted in the remote system',
  })
  @IsBoolean()
  @IsOptional()
  remote_was_deleted?: boolean;
}
