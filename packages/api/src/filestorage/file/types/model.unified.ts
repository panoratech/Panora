import { UnifiedFilestoragePermissionOutput } from '@filestorage/permission/types/model.unified';
import { UnifiedFilestorageSharedlinkOutput } from '@filestorage/sharedlink/types/model.unified';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsUUID, IsOptional, IsString } from 'class-validator';

export class UnifiedFilestorageFileInput {
  @ApiProperty({
    type: String,
    example: 'my_paris_photo.png',
    description: 'The name of the file',
  })
  @IsString()
  name: string;

  @ApiProperty({
    type: String,
    example: 'https://example.com/my_paris_photo.png',
    description: 'The url of the file',
  })
  @IsString()
  file_url: string;

  @ApiProperty({
    type: String,
    example: 'application/pdf',
    description: 'The mime type of the file',
  })
  @IsString()
  mime_type: string;

  @ApiProperty({
    type: String,
    example: '1024',
    description: 'The size of the file',
  })
  @IsString()
  size: string;

  @ApiProperty({
    type: String,
    example: '801f9ede-c698-4e66-a7fc-48d19eebaa4f',
    description: 'The UUID of the folder tied to the file',
  })
  @IsString()
  folder_id: string;

  @ApiProperty({
    type: String,
    example: '801f9ede-c698-4e66-a7fc-48d19eebaa4f',
    description: 'The UUID of the permission tied to the file',
  })
  @IsString()
  permission: string | UnifiedFilestoragePermissionOutput;

  @ApiProperty({
    type: String,
    example: '801f9ede-c698-4e66-a7fc-48d19eebaa4f',
    description: 'The UUID of the shared link tied to the file',
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
  })
  @IsOptional()
  field_mappings?: Record<string, any>;
}

export class UnifiedFilestorageFileOutput extends UnifiedFilestorageFileInput {
  @ApiPropertyOptional({
    type: String,
    example: '801f9ede-c698-4e66-a7fc-48d19eebaa4f',
    description: 'The UUID of the file',
  })
  @IsUUID()
  @IsOptional()
  id?: string;

  @ApiPropertyOptional({
    type: String,
    example: 'id_1',
    description: 'The id of the file in the context of the 3rd Party',
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
  })
  @IsOptional()
  remote_data?: Record<string, any>;

  @ApiPropertyOptional({
    type: {},
    example: '2024-10-01T12:00:00Z',
    description: 'The created date of the object',
  })
  @IsOptional()
  created_at?: any;

  @ApiPropertyOptional({
    type: {},
    example: '2024-10-01T12:00:00Z',
    description: 'The modified date of the object',
  })
  @IsOptional()
  modified_at?: any;
}
