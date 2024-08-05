import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsUUID, IsOptional, IsString } from 'class-validator';

export class UnifiedAtsRejectreasonInput {
  @ApiPropertyOptional({
    type: String,
    example: 'Candidate inexperienced',
    nullable: true,
    description: 'The name of the reject reason',
  })
  @IsString()
  @IsOptional()
  name?: string;

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

export class UnifiedAtsRejectreasonOutput extends UnifiedAtsRejectreasonInput {
  @ApiPropertyOptional({
    type: String,
    nullable: true,
    description: 'The UUID of the reject reason',
    example: '801f9ede-c698-4e66-a7fc-48d19eebaa4f',
  })
  @IsUUID()
  @IsOptional()
  id?: string;

  @ApiPropertyOptional({
    type: String,
    nullable: true,
    description:
      'The remote ID of the reject reason in the context of the 3rd Party',
    example: 'id_1',
  })
  @IsString()
  @IsOptional()
  remote_id?: string;

  @ApiPropertyOptional({
    type: Object,
    example: {
      fav_dish: 'broccoli',
      fav_color: 'red',
    },
    nullable: true,
    additionalProperties: true,
    description:
      'The remote data of the reject reason in the context of the 3rd Party',
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
    example: '2024-10-01T12:00:00Z',
    type: Date,
    nullable: true,
    description: 'The modified date of the object',
  })
  @IsOptional()
  modified_at?: Date;
}
