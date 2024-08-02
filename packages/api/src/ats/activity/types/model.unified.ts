import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsUUID,
  IsOptional,
  IsString,
  IsDateString,
  IsIn,
} from 'class-validator';

export type ActivityType = 'NOTE' | 'EMAIL' | 'OTHER';
export type ActivityVisibility = 'ADMIN_ONLY' | 'PUBLIC' | 'PRIVATE';

export class UnifiedAtsActivityInput {
  @ApiPropertyOptional({
    type: String,
    nullable: true,
    description: 'The type of activity',
  })
  @IsIn(['NOTE', 'EMAIL', 'OTHER'])
  @IsOptional()
  activity_type?: ActivityType | string;

  @ApiPropertyOptional({
    type: String,
    nullable: true,
    description: 'The subject of the activity',
  })
  @IsString()
  @IsOptional()
  subject?: string;

  @ApiPropertyOptional({
    type: String,
    nullable: true,
    description: 'The body of the activity',
  })
  @IsString()
  @IsOptional()
  body?: string;

  @ApiPropertyOptional({
    type: String,
    nullable: true,
    description: 'The visibility of the activity',
  })
  @IsIn(['ADMIN_ONLY', 'PUBLIC', 'PRIVATE'])
  @IsOptional()
  visibility?: ActivityVisibility | string;

  @ApiPropertyOptional({
    type: String,
    nullable: true,
    description: 'The UUID of the candidate',
  })
  @IsUUID()
  @IsOptional()
  candidate_id?: string;

  @ApiPropertyOptional({
    type: Date,
    nullable: true,
    description: 'The remote creation date of the activity',
  })
  @IsDateString()
  @IsOptional()
  remote_created_at?: string;

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

export class UnifiedAtsActivityOutput extends UnifiedAtsActivityInput {
  @ApiPropertyOptional({
    type: String,
    nullable: true,
    description: 'The UUID of the activity',
  })
  @IsUUID()
  @IsOptional()
  id?: string;

  @ApiPropertyOptional({
    type: String,
    nullable: true,
    description:
      'The remote ID of the activity in the context of the 3rd Party',
  })
  @IsString()
  @IsOptional()
  remote_id?: string;

  @ApiPropertyOptional({
    type: Object,
    nullable: true,
    additionalProperties: true,
    description:
      'The remote data of the activity in the context of the 3rd Party',
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
