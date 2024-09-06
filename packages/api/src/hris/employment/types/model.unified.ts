import { CurrencyCode } from '@@core/utils/types';
import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsUUID,
  IsOptional,
  IsString,
  IsNumber,
  IsDateString,
  IsBoolean,
} from 'class-validator';

export type FlsaStatus =
  | 'EXEMPT'
  | 'SALARIED_NONEXEMPT'
  | 'NONEXEMPT'
  | 'OWNER';

export type EmploymentType =
  | 'FULL_TIME'
  | 'PART_TIME'
  | 'INTERN'
  | 'CONTRACTOR'
  | 'FREELANCE';

export type PayFrequency =
  | 'WEEKLY'
  | 'BIWEEKLY'
  | 'MONTHLY'
  | 'QUARTERLY'
  | 'SEMIANNUALLY'
  | 'ANNUALLY'
  | 'THIRTEEN-MONTHLY'
  | 'PRO_RATA'
  | 'SEMIMONTHLY';

export type PayPeriod =
  | 'HOUR'
  | 'DAY'
  | 'WEEK'
  | 'EVERY_TWO_WEEKS'
  | 'SEMIMONTHLY'
  | 'MONTH'
  | 'QUARTER'
  | 'EVERY_SIX_MONTHS'
  | 'YEAR';

export class UnifiedHrisEmploymentInput {
  @ApiPropertyOptional({
    type: String,
    example: 'Software Engineer',
    nullable: true,
    description: 'The job title of the employment',
  })
  @IsString()
  @IsOptional()
  job_title?: string;

  @ApiPropertyOptional({
    type: Number,
    example: 100000,
    nullable: true,
    description: 'The pay rate of the employment',
  })
  @IsNumber()
  @IsOptional()
  pay_rate?: number;

  @ApiPropertyOptional({
    type: String,
    example: 'MONTHLY',
    /* enum: [
      'HOUR',
      'DAY',
      'WEEK',
      'EVERY_TWO_WEEKS',
      'SEMIMONTHLY',
      'MONTH',
      'QUARTER',
      'EVERY_SIX_MONTHS',
      'YEAR',
    ],*/
    nullable: true,
    description: 'The pay period of the employment',
  })
  @IsString()
  @IsOptional()
  pay_period?: PayPeriod | string;

  @ApiPropertyOptional({
    type: String,
    example: 'WEEKLY',
    /* enum: [
      'WEEKLY',
      'BIWEEKLY',
      'MONTHLY',
      'QUARTERLY',
      'SEMIANNUALLY',
      'ANNUALLY',
      'THIRTEEN-MONTHLY',
      'PRO_RATA',
      'SEMIMONTHLY',
    ],*/
    nullable: true,
    description: 'The pay frequency of the employment',
  })
  @IsString()
  @IsOptional()
  pay_frequency?: PayFrequency | string;

  @ApiPropertyOptional({
    type: String,
    example: 'USD',
    // enum: CurrencyCode,
    nullable: true,
    description: 'The currency of the pay',
  })
  @IsString()
  @IsOptional()
  pay_currency?: CurrencyCode;

  @ApiPropertyOptional({
    type: String,
    example: 'EXEMPT',
    // enum: ['EXEMPT', 'SALARIED_NONEXEMPT', 'NONEXEMPT', 'OWNER'],
    nullable: true,
    description: 'The FLSA status of the employment',
  })
  @IsString()
  @IsOptional()
  flsa_status?: FlsaStatus | string;

  @ApiPropertyOptional({
    type: Date,
    example: '2023-01-01',
    nullable: true,
    description: 'The effective date of the employment',
  })
  @IsDateString()
  @IsOptional()
  effective_date?: Date;

  @ApiPropertyOptional({
    type: String,
    example: 'FULL_TIME',
    // enum: ['FULL_TIME', 'PART_TIME', 'INTERN', 'CONTRACTOR', 'FREELANCE'],
    nullable: true,
    description: 'The type of employment',
  })
  @IsString()
  @IsOptional()
  employment_type?: EmploymentType | string;

  @ApiPropertyOptional({
    type: String,
    example: '801f9ede-c698-4e66-a7fc-48d19eebaa4f',
    nullable: true,
    description: 'The UUID of the associated pay group',
  })
  @IsUUID()
  @IsOptional()
  pay_group_id?: string;

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

export class UnifiedHrisEmploymentOutput extends UnifiedHrisEmploymentInput {
  @ApiPropertyOptional({
    type: String,
    example: '801f9ede-c698-4e66-a7fc-48d19eebaa4f',
    nullable: true,
    description: 'The UUID of the employment record',
  })
  @IsUUID()
  @IsOptional()
  id?: string;

  @ApiPropertyOptional({
    type: String,
    example: 'employment_1234',
    nullable: true,
    description:
      'The remote ID of the employment in the context of the 3rd Party',
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
      'The remote data of the employment in the context of the 3rd Party',
  })
  @IsOptional()
  remote_data?: Record<string, any>;

  @ApiPropertyOptional({
    type: Date,
    example: '2024-10-01T12:00:00Z',
    nullable: true,
    description:
      'The date when the employment was created in the 3rd party system',
  })
  @IsDateString()
  @IsOptional()
  remote_created_at?: Date;

  @ApiPropertyOptional({
    type: Date,
    example: '2024-10-01T12:00:00Z',
    nullable: true,
    description: 'The created date of the employment record',
  })
  @IsDateString()
  @IsOptional()
  created_at?: Date;

  @ApiPropertyOptional({
    type: Date,
    example: '2024-10-01T12:00:00Z',
    nullable: true,
    description: 'The last modified date of the employment record',
  })
  @IsDateString()
  @IsOptional()
  modified_at?: Date;

  @ApiPropertyOptional({
    type: Boolean,
    example: false,
    nullable: true,
    description: 'Indicates if the employment was deleted in the remote system',
  })
  @IsBoolean()
  @IsOptional()
  remote_was_deleted?: boolean;
}
