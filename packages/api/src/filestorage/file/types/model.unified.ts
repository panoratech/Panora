import { UnifiedFilestoragePermissionOutput } from '@filestorage/permission/types/model.unified';
import { UnifiedFilestorageSharedlinkOutput } from '@filestorage/sharedlink/types/model.unified';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsUUID, IsOptional, IsString } from 'class-validator';

export class UnifiedFilestorageFileInput {
  @ApiProperty({
    type: String,
    example: 'my_paris_photo.png',
    description: 'The name of the file',
    nullable: true,
  })
  @IsString()
  name: string;

  @ApiProperty({
    type: String,
    example: 'https://example.com/my_paris_photo.png',
    description: 'The url of the file',
    nullable: true,
  })
  @IsString()
  file_url: string;

  @ApiProperty({
    type: String,
    example: 'application/pdf',
    description: 'The mime type of the file',
    nullable: true,
  })
  @IsString()
  mime_type: string;

  @ApiProperty({
    type: String,
    example: '1024',
    description: 'The size of the file',
    nullable: true,
  })
  @IsString()
  size: string;

  @ApiProperty({
    type: String,
    example: '801f9ede-c698-4e66-a7fc-48d19eebaa4f',
    description: 'The UUID of the folder tied to the file',
    nullable: true,
  })
  @IsString()
  folder_id: string;

  @ApiProperty({
    type: String,
    example: '801f9ede-c698-4e66-a7fc-48d19eebaa4f',
    description: 'The UUID of the drive tied to the file',
    nullable: true,
  })
  @IsString()
  @IsOptional()
  drive_id?: string;

  @ApiProperty({
    type: String,
    example: '801f9ede-c698-4e66-a7fc-48d19eebaa4f',
    description: 'The UUID of the permission tied to the file',
    nullable: true,
  })
  @IsString()
  permissions: string[] | UnifiedFilestoragePermissionOutput[];

  @ApiProperty({
    type: String,
    example: '801f9ede-c698-4e66-a7fc-48d19eebaa4f',
    description: 'The UUID of the shared link tied to the file',
    nullable: true,
  })
  @IsString()
  shared_link: string | UnifiedFilestorageSharedlinkOutput;

  @ApiPropertyOptional({
    type: Object,
    example: {
      fav_dish: 'broccoli',
      fav_color: 'red',
    },
    description:
      'The custom field mappings of the object between the remote 3rd party & Panora',
    nullable: true,
    additionalProperties: true,
  })
  @IsOptional()
  field_mappings?: Record<string, any>;
}

export class UnifiedFilestorageFileOutput extends UnifiedFilestorageFileInput {
  @ApiPropertyOptional({
    type: String,
    example: '801f9ede-c698-4e66-a7fc-48d19eebaa4f',
    description: 'The UUID of the file',
    nullable: true,
  })
  @IsUUID()
  @IsOptional()
  id?: string;

  @ApiPropertyOptional({
    type: String,
    example: 'id_1',
    description: 'The id of the file in the context of the 3rd Party',
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
    description: 'The remote data of the file in the context of the 3rd Party',
    nullable: true,
    additionalProperties: true,
  })
  @IsOptional()
  remote_data?: Record<string, any>;

  @ApiPropertyOptional({
    type: String,
    example: 'folder_123',
    description: 'The id of the parent folder in the context of the 3rd Party',
    nullable: true,
  })
  @IsString()
  @IsOptional()
  remote_folder_id?: string;

  @ApiPropertyOptional({
    type: String,
    example: 'drive_123',
    description: 'The id of the parent drive in the context of the 3rd Party',
    nullable: true,
  })
  @IsString()
  @IsOptional()
  remote_drive_id?: string;

  @ApiPropertyOptional({
    example: '2024-10-01T12:00:00Z',
    type: Date,
    description: 'The created date of the object',
    nullable: true,
  })
  @IsOptional()
  created_at?: Date;

  @ApiPropertyOptional({
    example: '2024-10-01T12:00:00Z',
    type: Date,
    description: 'The modified date of the object',
    nullable: true,
  })
  @IsOptional()
  modified_at?: Date;

  @ApiPropertyOptional({
    example: '2024-10-01T12:00:00Z',
    type: Date,
    description:
      'The created date of the object in the context of the 3rd Party',
    nullable: true,
  })
  @IsOptional()
  remote_created_at?: Date;

  @ApiPropertyOptional({
    example: '2024-10-01T12:00:00Z',
    type: Date,
    description:
      'The modified date of the object in the context of the 3rd Party',
    nullable: true,
  })
  @IsOptional()
  remote_modified_at?: Date;

  @ApiPropertyOptional({
    example: false,
    type: Boolean,
    description:
      'Whether the object was deleted in the context of the 3rd Party',
    default: false,
  })
  @IsOptional()
  remote_was_deleted?: boolean;
}
