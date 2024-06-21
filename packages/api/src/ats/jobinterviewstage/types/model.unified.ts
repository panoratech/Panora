import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsUUID,
  IsOptional,
  IsString,
  IsInt,
  IsDateString,
} from 'class-validator';

export class UnifiedJobInterviewStageInput {
  @ApiPropertyOptional({
    type: String,
    description: 'The name of the job interview stage',
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ type: Number, description: 'The order of the stage' })
  @IsInt()
  @IsOptional()
  stage_order?: number;

  @ApiPropertyOptional({ type: String, description: 'The UUID of the job' })
  @IsUUID()
  @IsOptional()
  job_id?: string;
}

export class UnifiedJobInterviewStageOutput extends UnifiedJobInterviewStageInput {
  @ApiPropertyOptional({
    type: String,
    description: 'The UUID of the job interview stage',
  })
  @IsUUID()
  @IsOptional()
  id?: string;

  @ApiPropertyOptional({
    type: String,
    description:
      'The remote ID of the job interview stage in the context of the 3rd Party',
  })
  @IsString()
  @IsOptional()
  remote_id?: string;

  @ApiPropertyOptional({
    type: {},
    description:
      'The remote data of the job interview stage in the context of the 3rd Party',
  })
  @IsOptional()
  remote_data?: Record<string, any>;
}
