import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsUUID,
  IsOptional,
  IsString,
  IsNumber,
  IsDateString,
  IsBoolean,
} from 'class-validator';

export type PolicyType =
  | 'VACATION'
  | 'SICK'
  | 'PERSONAL'
  | 'JURY_DUTY'
  | 'VOLUNTEER'
  | 'BEREAVEMENT';

export class UnifiedHrisTimeoffbalanceInput {
  @ApiPropertyOptional({
    type: Number,
    example: 80,
    nullable: true,
    description: 'The current balance of time off',
  })
  @IsNumber()
  @IsOptional()
  balance?: number;

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
    type: Number,
    example: 40,
    nullable: true,
    description: 'The amount of time off used',
  })
  @IsNumber()
  @IsOptional()
  used?: number;

  @ApiPropertyOptional({
    type: String,
    example: 'VACATION',
    /*enum: [
      'VACATION',
      'SICK',
      'PERSONAL',
      'JURY_DUTY',
      'VOLUNTEER',
      'BEREAVEMENT',
    ],*/
    nullable: true,
    description: 'The type of time off policy',
  })
  @IsString()
  @IsOptional()
  policy_type?: PolicyType | string;

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

export class UnifiedHrisTimeoffbalanceOutput extends UnifiedHrisTimeoffbalanceInput {
  @ApiPropertyOptional({
    type: String,
    example: '801f9ede-c698-4e66-a7fc-48d19eebaa4f',
    nullable: true,
    description: 'The UUID of the time off balance record',
  })
  @IsUUID()
  @IsOptional()
  id?: string;

  @ApiPropertyOptional({
    type: String,
    example: 'timeoff_balance_1234',
    nullable: true,
    description:
      'The remote ID of the time off balance in the context of the 3rd Party',
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
      'The remote data of the time off balance in the context of the 3rd Party',
  })
  @IsOptional()
  remote_data?: Record<string, any>;

  @ApiPropertyOptional({
    type: String,
    example: '2024-06-15T12:00:00Z',
    nullable: true,
    description:
      'The date when the time off balance was created in the 3rd party system',
  })
  @IsDateString()
  @IsOptional()
  remote_created_at?: Date;

  @ApiPropertyOptional({
    type: String,
    example: '2024-06-15T12:00:00Z',
    nullable: true,
    description: 'The created date of the time off balance record',
  })
  @IsDateString()
  @IsOptional()
  created_at?: Date;

  @ApiPropertyOptional({
    type: String,
    example: '2024-06-15T12:00:00Z',
    nullable: true,
    description: 'The last modified date of the time off balance record',
  })
  @IsDateString()
  @IsOptional()
  modified_at?: Date;

  @ApiPropertyOptional({
    type: Boolean,
    example: false,
    nullable: true,
    description:
      'Indicates if the time off balance was deleted in the remote system',
  })
  @IsBoolean()
  @IsOptional()
  remote_was_deleted?: boolean;
}
