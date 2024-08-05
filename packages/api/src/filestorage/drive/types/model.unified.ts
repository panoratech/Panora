import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsUUID, IsOptional, IsString } from 'class-validator';

export class UnifiedFilestorageDriveInput {
  @ApiProperty({
    type: String,
    example: 'Family Drive',
    description: 'The name of the drive',
  })
  @IsString()
  name: string;

  @ApiPropertyOptional({
    type: Object,
    example: {
      fav_dish: 'broccoli',
      fav_color: 'red',
    },
    description: 'The custom field mappings of the drive',
  })
  @IsOptional()
  field_mappings?: Record<string, any>;
}

export class UnifiedFilestorageDriveOutput extends UnifiedFilestorageDriveInput {
  @ApiPropertyOptional({
    type: String,
    example: '801f9ede-c698-4e66-a7fc-48d19eebaa4f',
    description: 'The UUID of the drive',
  })
  @IsUUID()
  @IsOptional()
  id?: string;

  @ApiPropertyOptional({
    type: String,
    example: 'id_1',
    description: 'The remote ID of the drive in the context of the 3rd Party',
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
    description: 'The remote data of the drive in the context of the 3rd Party',
  })
  @IsOptional()
  remote_data?: Record<string, any>;

  @ApiPropertyOptional({
    type: {},
    example: '2024-10-01T12:00:00Z',
    description: 'The created date of the drive',
  })
  @IsOptional()
  created_at?: any;

  @ApiPropertyOptional({
    type: {},
    example: '2024-10-01T12:00:00Z',
    description: 'The modified date of the drive',
  })
  @IsOptional()
  modified_at?: any;
}
