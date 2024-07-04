import { UnifiedPermissionOutput } from '@filestorage/permission/types/model.unified';
import { UnifiedSharedLinkOutput } from '@filestorage/sharedlink/types/model.unified';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsUUID, IsOptional, IsString } from 'class-validator';

export class UnifiedFolderInput {
  @ApiProperty({ type: String, description: 'The name of the folder' })
  @IsString()
  name: string;

  @ApiProperty({ type: String, description: 'The size of the folder' })
  @IsString()
  size: string;

  @ApiProperty({ type: String, description: 'The url of the folder' })
  @IsString()
  folder_url: string;

  @ApiProperty({ type: String, description: 'The description of the folder' })
  @IsString()
  description: string;

  @ApiProperty({
    type: String,
    description: 'The UUID of the drive tied to the folder',
  })
  @IsString()
  drive_id: string;

  @ApiProperty({
    type: String,
    description: 'The UUID of the parent folder',
  })
  @IsString()
  parent_folder_id: string;

  @ApiProperty({
    type: String,
    description: 'The UUID of the shared link tied to the folder',
  })
  @IsString()
  shared_link: string | UnifiedSharedLinkOutput;

  @ApiProperty({
    type: String,
    description: 'The UUID of the permission tied to the folder',
  })
  @IsString()
  permission: string | UnifiedPermissionOutput;

  @ApiPropertyOptional({
    type: {},
    description:
      'The custom field mappings of the object between the remote 3rd party & Panora',
  })
  @IsOptional()
  field_mappings?: Record<string, any>;
}

export class UnifiedFolderOutput extends UnifiedFolderInput {
  @ApiPropertyOptional({ type: String, description: 'The UUID of the folder' })
  @IsUUID()
  @IsOptional()
  id?: string;

  @ApiPropertyOptional({
    type: String,
    description: 'The id of the folder in the context of the 3rd Party',
  })
  @IsString()
  @IsOptional()
  remote_id?: string;

  @ApiPropertyOptional({
    type: {},
    description:
      'The remote data of the folder in the context of the 3rd Party',
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
