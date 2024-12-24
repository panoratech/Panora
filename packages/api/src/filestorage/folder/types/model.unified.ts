import { UnifiedFilestoragePermissionOutput } from '@filestorage/permission/types/model.unified';
import { UnifiedFilestorageSharedlinkOutput } from '@filestorage/sharedlink/types/model.unified';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsUUID, IsOptional, IsString } from 'class-validator';

export class UnifiedFilestorageFolderInput {
  @ApiProperty({
    type: String,
    example: 'school',
    nullable: true,
    description: 'The name of the folder',
  })
  @IsString()
  name: string;

  @ApiProperty({
    type: String,
    example: '2048',
    nullable: true,
    description: 'The size of the folder',
  })
  @IsString()
  size: string;

  @ApiProperty({
    type: String,
    example: 'https://example.com/school',
    nullable: true,
    description: 'The url of the folder',
  })
  @IsString()
  folder_url: string;

  @ApiProperty({
    type: String,
    example: 'All things school related',
    description: 'The description of the folder',
  })
  @IsString()
  description: string;

  @ApiProperty({
    type: String,
    example: '801f9ede-c698-4e66-a7fc-48d19eebaa4f',
    nullable: true,
    description: 'The UUID of the drive tied to the folder',
  })
  @IsString()
  drive_id: string;

  @ApiProperty({
    type: String,
    example: '801f9ede-c698-4e66-a7fc-48d19eebaa4f',
    nullable: true,
    description: 'The UUID of the parent folder',
  })
  @IsString()
  parent_folder_id: string;

  @ApiProperty({
    type: String,
    example: '801f9ede-c698-4e66-a7fc-48d19eebaa4f',
    nullable: true,
    description: 'The UUID of the shared link tied to the folder',
  })
  @IsString()
  shared_link: string | UnifiedFilestorageSharedlinkOutput;

  @ApiProperty({
    type: String,
    example: '801f9ede-c698-4e66-a7fc-48d19eebaa4f',
    nullable: true,
    description: 'The UUID of the permission tied to the folder',
  })
  @IsString()
  permissions: string[] | UnifiedFilestoragePermissionOutput[];

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

export class UnifiedFilestorageFolderOutput extends UnifiedFilestorageFolderInput {
  @ApiPropertyOptional({
    type: String,
    example: '801f9ede-c698-4e66-a7fc-48d19eebaa4f',
    nullable: true,
    description: 'The UUID of the folder',
  })
  @IsUUID()
  @IsOptional()
  id?: string;

  @ApiPropertyOptional({
    type: String,
    example: 'id_1',
    description: 'The remote ID of the folder in the context of the 3rd Party',
    nullable: true,
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
    additionalProperties: true,
    nullable: true,
    description:
      'The remote data of the folder in the context of the 3rd Party',
  })
  @IsOptional()
  remote_data?: Record<string, any>;

  @ApiPropertyOptional({
    type: String,
    example: 'drive_123',
    description: 'The remote ID of the drive in the context of the 3rd Party',
    nullable: true,
  })
  @IsString()
  @IsOptional()
  remote_drive_id?: string;

  @ApiPropertyOptional({
    example: '2024-10-01T12:00:00Z',
    description: 'The created date of the folder',
    type: Date,
    nullable: true,
  })
  @IsOptional()
  created_at?: Date;

  @ApiPropertyOptional({
    example: '2024-10-01T12:00:00Z',
    description: 'The modified date of the folder',
    type: Date,
    nullable: true,
  })
  @IsOptional()
  modified_at?: Date;

  @ApiPropertyOptional({
    example: '2024-10-01T12:00:00Z',
    type: Date,
    description:
      'The created date of the folder in the context of the 3rd Party',
    nullable: true,
  })
  @IsOptional()
  remote_created_at?: Date;

  @ApiPropertyOptional({
    example: '2024-10-01T12:00:00Z',
    type: Date,
    description:
      'The modified date of the folder in the context of the 3rd Party',
    nullable: true,
  })
  @IsOptional()
  remote_modified_at?: Date;

  @ApiPropertyOptional({
    example: false,
    type: Boolean,
    description:
      'Whether the folder was deleted in the context of the 3rd Party',
    default: false,
  })
  @IsOptional()
  remote_was_deleted?: boolean;
}
