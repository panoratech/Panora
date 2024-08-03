import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsUUID,
  IsOptional,
  IsString,
  IsInt,
  IsDateString,
} from 'class-validator';

export class UnifiedAtsJobinterviewstageInput {
  @ApiPropertyOptional({
    type: String,
    nullable: true,
    description: 'The name of the job interview stage',
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({
    type: Number,
    nullable: true,
    description: 'The order of the stage',
  })
  @IsInt()
  @IsOptional()
  stage_order?: number;

  @ApiPropertyOptional({
    type: String,
    nullable: true,
    description: 'The UUID of the job',
  })
  @IsUUID()
  @IsOptional()
  job_id?: string;

  @ApiPropertyOptional({
    type: Object,
    additionalProperties: true,
    nullable: true,
    description:
      'The custom field mappings of the object between the remote 3rd party & Panora',
  })
  @IsOptional()
  field_mappings?: Record<string, any>;
}

export class UnifiedAtsJobinterviewstageOutput extends UnifiedAtsJobinterviewstageInput {
  @ApiPropertyOptional({
    type: String,
    nullable: true,
    description: 'The UUID of the job interview stage',
  })
  @IsUUID()
  @IsOptional()
  id?: string;

  @ApiPropertyOptional({
    type: String,
    nullable: true,
    description:
      'The remote ID of the job interview stage in the context of the 3rd Party',
  })
  @IsString()
  @IsOptional()
  remote_id?: string;

  @ApiPropertyOptional({
    type: Object,
    nullable: true,
    additionalProperties: true,
    description:
      'The remote data of the job interview stage in the context of the 3rd Party',
  })
  @IsOptional()
  remote_data?: Record<string, any>;

  @ApiPropertyOptional({
    type: Date,
    nullable: true,
    description: 'The created date of the object',
  })
  @IsOptional()
  created_at?: Date;

  @ApiPropertyOptional({
    type: Date,
    nullable: true,
    description: 'The modified date of the object',
  })
  @IsOptional()
  modified_at?: Date;
}
