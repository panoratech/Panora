import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsUUID, IsOptional, IsString } from 'class-validator';

export class UnifiedDriveInput {
  @ApiProperty({ type: String, description: 'The name of the drive' })
  @IsString()
  name: string;

  @ApiProperty({
    type: String,
    description: 'When the third party s drive was created.',
  })
  @IsString()
  remote_created_at: string;

  @ApiProperty({ type: String, description: 'The url of the drive' })
  @IsString()
  drive_url: string;

  @ApiPropertyOptional({
    type: {},
    description:
      'The custom field mappings of the object between the remote 3rd party & Panora',
  })
  @IsOptional()
  field_mappings?: Record<string, any>;
}

export class UnifiedDriveOutput extends UnifiedDriveInput {
  @ApiPropertyOptional({ type: String, description: 'The UUID of the drive' })
  @IsUUID()
  @IsOptional()
  id?: string;

  @ApiPropertyOptional({
    type: String,
    description: 'The id of the drive in the context of the 3rd Party',
  })
  @IsString()
  @IsOptional()
  remote_id?: string;

  @ApiPropertyOptional({
    type: {},
    description: 'The remote data of the drive in the context of the 3rd Party',
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
