import { UnifiedPermissionOutput } from '@filestorage/permission/types/model.unified';
import { UnifiedSharedLinkOutput } from '@filestorage/sharedlink/types/model.unified';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsUUID, IsOptional, IsString } from 'class-validator';

export class UnifiedFileInput {
  @ApiProperty({ type: String, description: 'The name of the file' })
  @IsString()
  name: string;

  @ApiProperty({ type: String, description: 'The url of the file' })
  @IsString()
  file_url: string;

  @ApiProperty({ type: String, description: 'The mime type of the file' })
  @IsString()
  mime_type: string;

  @ApiProperty({ type: String, description: 'The size of the file' })
  @IsString()
  size: string;

  @ApiProperty({
    type: String,
    description: 'The UUID of the folder tied to the file',
  })
  @IsString()
  folder_id: string;

  @ApiProperty({
    type: String,
    description: 'The UUID of the permission tied to the file',
  })
  @IsString()
  permission: string | UnifiedPermissionOutput;

  @ApiProperty({
    type: String,
    description: 'The UUID of the shared link tied to the file',
  })
  @IsString()
  shared_link: string | UnifiedSharedLinkOutput;

  @ApiPropertyOptional({
    type: {},
    description:
      'The custom field mappings of the object between the remote 3rd party & Panora',
  })
  @IsOptional()
  field_mappings?: Record<string, any>;
}

export class UnifiedFileOutput extends UnifiedFileInput {
  @ApiPropertyOptional({ type: String, description: 'The UUID of the file' })
  @IsUUID()
  @IsOptional()
  id?: string;

  @ApiPropertyOptional({
    type: String,
    description: 'The id of the file in the context of the 3rd Party',
  })
  @IsString()
  @IsOptional()
  remote_id?: string;

  @ApiPropertyOptional({
    type: {},
    description: 'The remote data of the file in the context of the 3rd Party',
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
