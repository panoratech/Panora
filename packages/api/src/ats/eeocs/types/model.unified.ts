import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsUUID, IsOptional, IsString, IsDateString } from 'class-validator';

export class UnifiedEeocsInput {
  @ApiPropertyOptional({
    type: String,
    description: 'The UUID of the candidate',
  })
  @IsUUID()
  @IsOptional()
  candidate_id?: string;

  @ApiPropertyOptional({
    type: String,
    format: 'date-time',
    description: 'The submission date of the EEOC',
  })
  @IsDateString()
  @IsOptional()
  submitted_at?: string;

  @ApiPropertyOptional({
    type: String,
    description: 'The race of the candidate',
  })
  @IsString()
  @IsOptional()
  race?: string;

  @ApiPropertyOptional({
    type: String,
    description: 'The gender of the candidate',
  })
  @IsString()
  @IsOptional()
  gender?: string;

  @ApiPropertyOptional({
    type: String,
    description: 'The veteran status of the candidate',
  })
  @IsString()
  @IsOptional()
  veteran_status?: string;

  @ApiPropertyOptional({
    type: String,
    description: 'The disability status of the candidate',
  })
  @IsString()
  @IsOptional()
  disability_status?: string;
}

export class UnifiedEeocsOutput extends UnifiedEeocsInput {
  @ApiPropertyOptional({ type: String, description: 'The UUID of the EEOC' })
  @IsUUID()
  @IsOptional()
  id?: string;

  @ApiPropertyOptional({
    type: String,
    description: 'The remote ID of the EEOC in the context of the 3rd Party',
  })
  @IsString()
  @IsOptional()
  remote_id?: string;

  @ApiPropertyOptional({
    type: {},
    description: 'The remote data of the EEOC in the context of the 3rd Party',
  })
  @IsOptional()
  remote_data?: Record<string, any>;
}
