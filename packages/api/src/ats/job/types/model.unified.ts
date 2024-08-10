import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsUUID,
  IsOptional,
  IsString,
  IsBoolean,
  IsDateString,
  IsArray,
  IsIn,
} from 'class-validator';

export type JobStatus = 'OPEN' | 'CLOSED' | 'DRAFT' | 'ARCHIVED' | 'PENDING';
export type JobType = 'POSTING' | 'REQUISITION' | 'PROFILE';

export class UnifiedAtsJobInput {
  @ApiPropertyOptional({
    type: String,
    example: 'Financial Analyst',
    nullable: true,
    description: 'The name of the job',
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({
    type: String,
    example: 'Extract financial data and write detailed investment thesis',
    nullable: true,
    description: 'The description of the job',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    type: String,
    example: 'JOB123',
    nullable: true,
    description: 'The code of the job',
  })
  @IsString()
  @IsOptional()
  code?: string;

  @ApiPropertyOptional({
    type: String,
    enum: ['OPEN', 'CLOSED', 'DRAFT', 'ARCHIVED', 'PENDING'],
    example: 'OPEN',
    nullable: true,
    description: 'The status of the job',
  })
  @IsIn(['OPEN', 'CLOSED', 'DRAFT', 'ARCHIVED', 'PENDING'])
  @IsOptional()
  status?: JobStatus | string;

  @ApiPropertyOptional({
    type: String,
    example: 'POSTING',
    enum: ['POSTING', 'REQUISITION', 'PROFILE'],
    nullable: true,
    description: 'The type of the job',
  })
  @IsIn(['POSTING', 'REQUISITION', 'PROFILE'])
  @IsOptional()
  type?: JobType | string;

  @ApiPropertyOptional({
    type: Boolean,
    example: true,
    nullable: true,
    description: 'Whether the job is confidential',
  })
  @IsBoolean()
  @IsOptional()
  confidential?: boolean;

  @ApiPropertyOptional({
    type: [String],
    example: ['801f9ede-c698-4e66-a7fc-48d19eebaa4f'],
    nullable: true,
    description: 'The departments UUIDs associated with the job',
  })
  @IsArray()
  @IsOptional()
  departments?: string[];

  @ApiPropertyOptional({
    type: [String],
    example: ['801f9ede-c698-4e66-a7fc-48d19eebaa4f'],
    nullable: true,
    description: 'The offices UUIDs associated with the job',
  })
  @IsArray()
  @IsOptional()
  offices?: string[];

  @ApiPropertyOptional({
    type: [String],
    example: ['801f9ede-c698-4e66-a7fc-48d19eebaa4f'],
    nullable: true,
    description: 'The managers UUIDs associated with the job',
  })
  @IsArray()
  @IsOptional()
  managers?: string[];

  @ApiPropertyOptional({
    type: [String],
    example: ['801f9ede-c698-4e66-a7fc-48d19eebaa4f'],
    nullable: true,
    description: 'The recruiters UUIDs associated with the job',
  })
  @IsArray()
  @IsOptional()
  recruiters?: string[];

  @ApiPropertyOptional({
    type: String,
    example: '2024-10-01T12:00:00Z',
    format: 'date-time',
    nullable: true,
    description: 'The remote creation date of the job',
  })
  @IsDateString()
  @IsOptional()
  remote_created_at?: string;

  @ApiPropertyOptional({
    type: String,
    example: '2024-10-01T12:00:00Z',
    format: 'date-time',
    nullable: true,
    description: 'The remote modification date of the job',
  })
  @IsDateString()
  @IsOptional()
  remote_updated_at?: string;

  @ApiPropertyOptional({
    type: Object,
    example: {
      fav_dish: 'broccoli',
      fav_color: 'red',
    },
    additionalProperties: true,
    nullable: true,
    description:
      'The custom field mappings of the object between the remote 3rd party & Panora',
  })
  @IsOptional()
  field_mappings?: Record<string, any>;
}

export class UnifiedAtsJobOutput extends UnifiedAtsJobInput {
  @ApiPropertyOptional({
    type: String,
    example: '801f9ede-c698-4e66-a7fc-48d19eebaa4f',
    nullable: true,
    description: 'The UUID of the job',
  })
  @IsUUID()
  @IsOptional()
  id?: string;

  @ApiPropertyOptional({
    type: String,
    example: 'id_1',
    nullable: true,
    description: 'The remote ID of the job in the context of the 3rd Party',
  })
  @IsString()
  @IsOptional()
  remote_id?: string;

  @ApiPropertyOptional({
    type: Object,
    example: { key1: 'value1', key2: 42, key3: true },
    nullable: true,
    additionalProperties: true,
    description: 'The remote data of the job in the context of the 3rd Party',
  })
  @IsOptional()
  remote_data?: Record<string, any>;

  @ApiPropertyOptional({
    example: '2024-10-01T12:00:00Z',
    type: Date,
    nullable: true,
    description: 'The created date of the object',
  })
  @IsOptional()
  created_at?: Date;

  @ApiPropertyOptional({
    type: Date,
    example: '2023-10-01T12:00:00Z',
    nullable: true,
    description: 'The modified date of the object',
  })
  @IsOptional()
  modified_at?: Date;
}
