import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsUUID, IsOptional, IsString } from 'class-validator';

export class UnifiedFilestorageDriveInput {
  @ApiProperty({
    type: String,
    nullable: true,
    description: 'The name of the drive',
  })
  @IsString()
  name: string;

  @ApiProperty({
    type: String,
    nullable: true,
    description: 'When the third party s drive was created.',
  })
  @IsString()
  remote_created_at: string;

  @ApiProperty({
    type: String,
    nullable: true,
    description: 'The url of the drive',
  })
  @IsString()
  drive_url: string;

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

export class UnifiedFilestorageDriveOutput extends UnifiedFilestorageDriveInput {
  @ApiPropertyOptional({
    type: String,
    nullable: true,
    description: 'The UUID of the drive',
  })
  @IsUUID()
  @IsOptional()
  id?: string;

  @ApiPropertyOptional({
    type: String,
    nullable: true,
    description: 'The id of the drive in the context of the 3rd Party',
  })
  @IsString()
  @IsOptional()
  remote_id?: string;

  @ApiPropertyOptional({
    type: Object,
    nullable: true,
    additionalProperties: true,
    description: 'The remote data of the drive in the context of the 3rd Party',
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
