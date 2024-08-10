import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsUUID,
  IsOptional,
  IsString,
  IsDateString,
  IsNumber,
} from 'class-validator';

export class UnifiedHrisBenefitInput {
  @ApiPropertyOptional({
    type: String,
    example: 'Health Insurance Provider',
    nullable: true,
    description: 'The name of the benefit provider',
  })
  @IsString()
  @IsOptional()
  provider_name?: string;

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
    example: 100,
    nullable: true,
    description: 'The employee contribution amount',
  })
  @IsNumber()
  @IsOptional()
  employee_contribution?: number;

  @ApiPropertyOptional({
    type: Number,
    example: 200,
    nullable: true,
    description: 'The company contribution amount',
  })
  @IsNumber()
  @IsOptional()
  company_contribution?: number;

  @ApiPropertyOptional({
    type: String,
    example: '2024-01-01T00:00:00Z',
    nullable: true,
    description: 'The start date of the benefit',
  })
  @IsDateString()
  @IsOptional()
  start_date?: string;

  @ApiPropertyOptional({
    type: String,
    example: '2024-12-31T23:59:59Z',
    nullable: true,
    description: 'The end date of the benefit',
  })
  @IsDateString()
  @IsOptional()
  end_date?: string;

  @ApiPropertyOptional({
    type: String,
    example: '801f9ede-c698-4e66-a7fc-48d19eebaa4f',
    nullable: true,
    description: 'The UUID of the associated employer benefit',
  })
  @IsUUID()
  @IsOptional()
  employer_benefit_id?: string;

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

export class UnifiedHrisBenefitOutput extends UnifiedHrisBenefitInput {
  @ApiPropertyOptional({
    type: String,
    example: '801f9ede-c698-4e66-a7fc-48d19eebaa4f',
    nullable: true,
    description: 'The UUID of the benefit record',
  })
  @IsUUID()
  @IsOptional()
  id?: string;

  @ApiPropertyOptional({
    type: String,
    example: 'benefit_1234',
    nullable: true,
    description: 'The remote ID of the benefit in the context of the 3rd Party',
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
      'The remote data of the benefit in the context of the 3rd Party',
  })
  @IsOptional()
  remote_data?: Record<string, any>;

  @ApiPropertyOptional({
    type: String,
    example: '2024-10-01T12:00:00Z',
    nullable: true,
    description:
      'The date when the benefit was created in the 3rd party system',
  })
  @IsDateString()
  @IsOptional()
  remote_created_at?: string;

  @ApiPropertyOptional({
    type: String,
    example: '2024-10-01T12:00:00Z',
    nullable: true,
    description: 'The created date of the benefit record',
  })
  @IsDateString()
  @IsOptional()
  created_at?: string;

  @ApiPropertyOptional({
    type: String,
    example: '2024-10-01T12:00:00Z',
    nullable: true,
    description: 'The last modified date of the benefit record',
  })
  @IsDateString()
  @IsOptional()
  modified_at?: string;

  @ApiPropertyOptional({
    type: Boolean,
    example: false,
    nullable: true,
    description: 'Indicates if the benefit was deleted in the remote system',
  })
  @IsOptional()
  remote_was_deleted?: boolean;
}
