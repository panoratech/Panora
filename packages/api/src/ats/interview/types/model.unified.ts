import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsUUID,
  IsOptional,
  IsString,
  IsDateString,
  IsArray,
  IsIn,
} from 'class-validator';

export type InterviewStatus = 'SCHEDULED' | 'AWAITING_FEEDBACK' | 'COMPLETED';

export class UnifiedInterviewInput {
  @ApiPropertyOptional({
    type: String,
    description: 'The status of the interview',
  })
  @IsIn(['SCHEDULED', 'AWAITING_FEEDBACK', 'COMPLETED'])
  @IsOptional()
  status?: InterviewStatus | string;

  @ApiPropertyOptional({
    type: String,
    description: 'The UUID of the application',
  })
  @IsUUID()
  @IsOptional()
  application_id?: string;

  @ApiPropertyOptional({
    type: String,
    description: 'The UUID of the job interview stage',
  })
  @IsUUID()
  @IsOptional()
  job_interview_stage_id?: string;

  @ApiPropertyOptional({
    type: String,
    description: 'The UUID of the organizer',
  })
  @IsUUID()
  @IsOptional()
  organized_by?: string;

  @ApiPropertyOptional({
    type: [String],
    description: 'The UUIDs of the interviewers',
  })
  @IsArray()
  @IsOptional()
  interviewers?: string[];

  @ApiPropertyOptional({
    type: String,
    description: 'The location of the interview',
  })
  @IsString()
  @IsOptional()
  location?: string;

  @ApiPropertyOptional({
    type: String,
    format: 'date-time',
    description: 'The start date and time of the interview',
  })
  @IsDateString()
  @IsOptional()
  start_at?: string;

  @ApiPropertyOptional({
    type: String,
    format: 'date-time',
    description: 'The end date and time of the interview',
  })
  @IsDateString()
  @IsOptional()
  end_at?: string;

  @ApiPropertyOptional({
    type: String,
    format: 'date-time',
    description: 'The remote creation date of the interview',
  })
  @IsDateString()
  @IsOptional()
  remote_created_at?: string;

  @ApiPropertyOptional({
    type: String,
    format: 'date-time',
    description: 'The remote modification date of the interview',
  })
  @IsDateString()
  @IsOptional()
  remote_updated_at?: string;

  @ApiPropertyOptional({
    type: {},
    description:
      'The custom field mappings of the object between the remote 3rd party & Panora',
  })
  @IsOptional()
  field_mappings?: Record<string, any>;
}

export class UnifiedInterviewOutput extends UnifiedInterviewInput {
  @ApiPropertyOptional({
    type: String,
    description: 'The UUID of the interview',
  })
  @IsUUID()
  @IsOptional()
  id?: string;

  @ApiPropertyOptional({
    type: String,
    description:
      'The remote ID of the interview in the context of the 3rd Party',
  })
  @IsString()
  @IsOptional()
  remote_id?: string;

  @ApiPropertyOptional({
    type: {},
    description:
      'The remote data of the interview in the context of the 3rd Party',
  })
  @IsOptional()
  remote_data?: Record<string, any>;

  @ApiPropertyOptional({
    type: {},
    description: 'The created date of the object',
  })
  @IsOptional()
  created_at?: any;

  @ApiPropertyOptional({
    type: {},
    description: 'The modified date of the object',
  })
  @IsOptional()
  modified_at?: any;
}
