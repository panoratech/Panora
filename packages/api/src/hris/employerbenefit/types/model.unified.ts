import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsUUID,
  IsOptional,
  IsString,
  IsDateString,
  IsBoolean,
} from 'class-validator';

export class UnifiedHrisEmployerbenefitInput {
  @ApiPropertyOptional({
    type: String,
    example: 'Health Insurance',
    nullable: true,
    description: 'The type of the benefit plan',
  })
  @IsString()
  @IsOptional()
  benefit_plan_type?: string;

  @ApiPropertyOptional({
    type: String,
    example: 'Company Health Plan',
    nullable: true,
    description: 'The name of the employer benefit',
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({
    type: String,
    example: 'Comprehensive health insurance coverage for employees',
    nullable: true,
    description: 'The description of the employer benefit',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    type: String,
    example: 'HEALTH-001',
    nullable: true,
    description: 'The deduction code for the employer benefit',
  })
  @IsString()
  @IsOptional()
  deduction_code?: string;

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

export class UnifiedHrisEmployerbenefitOutput extends UnifiedHrisEmployerbenefitInput {
  @ApiPropertyOptional({
    type: String,
    example: '801f9ede-c698-4e66-a7fc-48d19eebaa4f',
    nullable: true,
    description: 'The UUID of the employer benefit record',
  })
  @IsUUID()
  @IsOptional()
  id?: string;

  @ApiPropertyOptional({
    type: String,
    example: 'benefit_1234',
    nullable: true,
    description:
      'The remote ID of the employer benefit in the context of the 3rd Party',
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
      'The remote data of the employer benefit in the context of the 3rd Party',
  })
  @IsOptional()
  remote_data?: Record<string, any>;

  @ApiPropertyOptional({
    type: String,
    example: '2024-10-01T12:00:00Z',
    nullable: true,
    description:
      'The date when the employer benefit was created in the 3rd party system',
  })
  @IsDateString()
  @IsOptional()
  remote_created_at?: string;

  @ApiPropertyOptional({
    type: String,
    example: '2024-10-01T12:00:00Z',
    nullable: true,
    description: 'The created date of the employer benefit record',
  })
  @IsDateString()
  @IsOptional()
  created_at?: string;

  @ApiPropertyOptional({
    type: String,
    example: '2024-10-01T12:00:00Z',
    nullable: true,
    description: 'The last modified date of the employer benefit record',
  })
  @IsDateString()
  @IsOptional()
  modified_at?: string;

  @ApiPropertyOptional({
    type: Boolean,
    example: false,
    nullable: true,
    description:
      'Indicates if the employer benefit was deleted in the remote system',
  })
  @IsBoolean()
  @IsOptional()
  remote_was_deleted?: boolean;
}
