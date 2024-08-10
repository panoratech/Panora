import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsUUID,
  IsOptional,
  IsString,
  IsArray,
  IsDateString,
  IsEmail,
  IsUrl,
} from 'class-validator';

export class UnifiedHrisEmployeeInput {
  @ApiPropertyOptional({
    type: [String],
    example: ['Group1', 'Group2'],
    nullable: true,
    description: 'The groups the employee belongs to',
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  groups?: string[];

  @ApiPropertyOptional({
    type: String,
    example: 'EMP001',
    nullable: true,
    description: 'The employee number',
  })
  @IsString()
  @IsOptional()
  employee_number?: string;

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
    example: 'John',
    nullable: true,
    description: 'The first name of the employee',
  })
  @IsString()
  @IsOptional()
  first_name?: string;

  @ApiPropertyOptional({
    type: String,
    example: 'Doe',
    nullable: true,
    description: 'The last name of the employee',
  })
  @IsString()
  @IsOptional()
  last_name?: string;

  @ApiPropertyOptional({
    type: String,
    example: 'Johnny',
    nullable: true,
    description: 'The preferred name of the employee',
  })
  @IsString()
  @IsOptional()
  preferred_name?: string;

  @ApiPropertyOptional({
    type: String,
    example: 'John Doe',
    nullable: true,
    description: 'The full display name of the employee',
  })
  @IsString()
  @IsOptional()
  display_full_name?: string;

  @ApiPropertyOptional({
    type: String,
    example: 'johndoe',
    nullable: true,
    description: 'The username of the employee',
  })
  @IsString()
  @IsOptional()
  username?: string;

  @ApiPropertyOptional({
    type: String,
    example: 'john.doe@company.com',
    nullable: true,
    description: 'The work email of the employee',
  })
  @IsEmail()
  @IsOptional()
  work_email?: string;

  @ApiPropertyOptional({
    type: String,
    example: 'john.doe@personal.com',
    nullable: true,
    description: 'The personal email of the employee',
  })
  @IsEmail()
  @IsOptional()
  personal_email?: string;

  @ApiPropertyOptional({
    type: String,
    example: '+1234567890',
    nullable: true,
    description: 'The mobile phone number of the employee',
  })
  @IsString()
  @IsOptional()
  mobile_phone_number?: string;

  @ApiPropertyOptional({
    type: [String],
    example: ['Employment1', 'Employment2'],
    nullable: true,
    description: 'The employments of the employee',
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  employments?: string[];

  @ApiPropertyOptional({
    type: String,
    example: '123-45-6789',
    nullable: true,
    description: 'The Social Security Number of the employee',
  })
  @IsString()
  @IsOptional()
  ssn?: string;

  @ApiPropertyOptional({
    type: String,
    example: 'Male',
    nullable: true,
    description: 'The gender of the employee',
  })
  @IsString()
  @IsOptional()
  gender?: string;

  @ApiPropertyOptional({
    type: String,
    example: 'Caucasian',
    nullable: true,
    description: 'The ethnicity of the employee',
  })
  @IsString()
  @IsOptional()
  ethnicity?: string;

  @ApiPropertyOptional({
    type: String,
    example: 'Married',
    nullable: true,
    description: 'The marital status of the employee',
  })
  @IsString()
  @IsOptional()
  marital_status?: string;

  @ApiPropertyOptional({
    type: String,
    example: '1990-01-01',
    nullable: true,
    description: 'The date of birth of the employee',
  })
  @IsDateString()
  @IsOptional()
  date_of_birth?: string;

  @ApiPropertyOptional({
    type: String,
    example: '2020-01-01',
    nullable: true,
    description: 'The start date of the employee',
  })
  @IsDateString()
  @IsOptional()
  start_date?: string;

  @ApiPropertyOptional({
    type: String,
    example: 'Active',
    nullable: true,
    description: 'The employment status of the employee',
  })
  @IsString()
  @IsOptional()
  employment_status?: string;

  @ApiPropertyOptional({
    type: String,
    example: '2025-01-01',
    nullable: true,
    description: 'The termination date of the employee',
  })
  @IsDateString()
  @IsOptional()
  termination_date?: string;

  @ApiPropertyOptional({
    type: String,
    example: 'https://example.com/avatar.jpg',
    nullable: true,
    description: "The URL of the employee's avatar",
  })
  @IsUrl()
  @IsOptional()
  avatar_url?: string;

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

export class UnifiedHrisEmployeeOutput extends UnifiedHrisEmployeeInput {
  @ApiPropertyOptional({
    type: String,
    example: '801f9ede-c698-4e66-a7fc-48d19eebaa4f',
    nullable: true,
    description: 'The UUID of the employee record',
  })
  @IsUUID()
  @IsOptional()
  id?: string;

  @ApiPropertyOptional({
    type: String,
    example: 'employee_1234',
    nullable: true,
    description:
      'The remote ID of the employee in the context of the 3rd Party',
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
      'The remote data of the employee in the context of the 3rd Party',
  })
  @IsOptional()
  remote_data?: Record<string, any>;

  @ApiPropertyOptional({
    type: String,
    example: '2024-10-01T12:00:00Z',
    nullable: true,
    description:
      'The date when the employee was created in the 3rd party system',
  })
  @IsDateString()
  @IsOptional()
  remote_created_at?: string;

  @ApiPropertyOptional({
    type: String,
    example: '2024-10-01T12:00:00Z',
    nullable: true,
    description: 'The created date of the employee record',
  })
  @IsDateString()
  @IsOptional()
  created_at?: string;

  @ApiPropertyOptional({
    type: String,
    example: '2024-10-01T12:00:00Z',
    nullable: true,
    description: 'The last modified date of the employee record',
  })
  @IsDateString()
  @IsOptional()
  modified_at?: string;

  @ApiPropertyOptional({
    type: Boolean,
    example: false,
    nullable: true,
    description: 'Indicates if the employee was deleted in the remote system',
  })
  @IsOptional()
  remote_was_deleted?: boolean;
}
