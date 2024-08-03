import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID } from 'class-validator';

export class UnifiedCrmStageInput {
  @ApiProperty({
    type: String,
    description: 'The name of the stage',
    nullable: true,
  })
  @IsString()
  stage_name: string;

  @ApiPropertyOptional({
    type: Object,
    description:
      'The custom field mappings of the stage between the remote 3rd party & Panora',
    nullable: true,
    additionalProperties: true,
  })
  @IsOptional()
  field_mappings?: Record<string, any>;
}

export class UnifiedCrmStageOutput extends UnifiedCrmStageInput {
  @ApiPropertyOptional({
    type: String,
    description: 'The UUID of the stage',
    nullable: true,
  })
  @IsUUID()
  @IsOptional()
  id?: string;

  @ApiPropertyOptional({
    type: String,
    description: 'The id of the stage in the context of the Crm 3rd Party',
    nullable: true,
  })
  @IsString()
  @IsOptional()
  remote_id?: string;

  @ApiPropertyOptional({
    type: Object,
    description:
      'The remote data of the stage in the context of the Crm 3rd Party',
    nullable: true,
    additionalProperties: true,
  })
  @IsOptional()
  remote_data?: Record<string, any>;

  @ApiPropertyOptional({
    type: Object,
    description: 'The created date of the object',
    nullable: true,
  })
  @IsOptional()
  created_at?: Date;

  @ApiPropertyOptional({
    type: Object,
    description: 'The modified date of the object',
    nullable: true,
  })
  @IsOptional()
  modified_at?: Date;
}
