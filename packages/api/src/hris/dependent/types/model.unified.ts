import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsUUID,
  IsOptional,
  IsString,
  IsDateString,
  IsBoolean,
} from 'class-validator';

export class UnifiedHrisDependentInput {
  @ApiPropertyOptional({
    type: String,
    example: 'John',
    nullable: true,
    description: 'The first name of the dependent',
  })
  @IsString()
  @IsOptional()
  first_name?: string;

  @ApiPropertyOptional({
    type: String,
    example: 'Doe',
    nullable: true,
    description: 'The last name of the dependent',
  })
  @IsString()
  @IsOptional()
  last_name?: string;

  @ApiPropertyOptional({
    type: String,
    example: 'Michael',
    nullable: true,
    description: 'The middle name of the dependent',
  })
  @IsString()
  @IsOptional()
  middle_name?: string;

  @ApiPropertyOptional({
    type: String,
    example: 'Child',
    nullable: true,
    description: 'The relationship of the dependent to the employee',
  })
  @IsString()
  @IsOptional()
  relationship?: string;

  @ApiPropertyOptional({
    type: String,
    example: '2020-01-01',
    nullable: true,
    description: 'The date of birth of the dependent',
  })
  @IsDateString()
  @IsOptional()
  date_of_birth?: string;

  @ApiPropertyOptional({
    type: String,
    example: 'Male',
    nullable: true,
    description: 'The gender of the dependent',
  })
  @IsString()
  @IsOptional()
  gender?: string;

  @ApiPropertyOptional({
    type: String,
    example: '+1234567890',
    nullable: true,
    description: 'The phone number of the dependent',
  })
  @IsString()
  @IsOptional()
  phone_number?: string;

  @ApiPropertyOptional({
    type: String,
    example: '801f9ede-c698-4e66-a7fc-48d19eebaa4f',
    nullable: true,
    description: 'The UUID of the home location',
  })
  @IsUUID()
  @IsOptional()
  home_location?: string;

  @ApiPropertyOptional({
    type: Boolean,
    example: true,
    nullable: true,
    description: 'Indicates if the dependent is a student',
  })
  @IsBoolean()
  @IsOptional()
  is_student?: boolean;

  @ApiPropertyOptional({
    type: String,
    example: '123-45-6789',
    nullable: true,
    description: 'The Social Security Number of the dependent',
  })
  @IsString()
  @IsOptional()
  ssn?: string;

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

export class UnifiedHrisDependentOutput extends UnifiedHrisDependentInput {
  @ApiPropertyOptional({
    type: String,
    example: '801f9ede-c698-4e66-a7fc-48d19eebaa4f',
    nullable: true,
    description: 'The UUID of the dependent record',
  })
  @IsUUID()
  @IsOptional()
  id?: string;

  @ApiPropertyOptional({
    type: String,
    example: 'dependent_1234',
    nullable: true,
    description:
      'The remote ID of the dependent in the context of the 3rd Party',
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
      'The remote data of the dependent in the context of the 3rd Party',
  })
  @IsOptional()
  remote_data?: Record<string, any>;

  @ApiPropertyOptional({
    type: String,
    example: '2024-10-01T12:00:00Z',
    nullable: true,
    description:
      'The date when the dependent was created in the 3rd party system',
  })
  @IsDateString()
  @IsOptional()
  remote_created_at?: string;

  @ApiPropertyOptional({
    type: String,
    example: '2024-10-01T12:00:00Z',
    nullable: true,
    description: 'The created date of the dependent record',
  })
  @IsDateString()
  @IsOptional()
  created_at?: string;

  @ApiPropertyOptional({
    type: String,
    example: '2024-10-01T12:00:00Z',
    nullable: true,
    description: 'The last modified date of the dependent record',
  })
  @IsDateString()
  @IsOptional()
  modified_at?: string;

  @ApiPropertyOptional({
    type: Boolean,
    example: false,
    nullable: true,
    description: 'Indicates if the dependent was deleted in the remote system',
  })
  @IsBoolean()
  @IsOptional()
  remote_was_deleted?: boolean;
}
