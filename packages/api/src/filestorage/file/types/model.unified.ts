import { UnifiedFilestoragePermissionOutput } from '@filestorage/permission/types/model.unified';
import { UnifiedFilestorageSharedlinkOutput } from '@filestorage/sharedlink/types/model.unified';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsUUID, IsOptional, IsString } from 'class-validator';

export class UnifiedFilestorageFileInput {
  @ApiProperty({
    type: String,
    description: 'The name of the file',
    nullable: true,
  })
  @IsString()
  name: string;

  @ApiProperty({
    type: String,
    description: 'The url of the file',
    nullable: true,
  })
  @IsString()
  file_url: string;

  @ApiProperty({
    type: String,
    description: 'The mime type of the file',
    nullable: true,
  })
  @IsString()
  mime_type: string;

  @ApiProperty({
    type: String,
    description: 'The size of the file',
    nullable: true,
  })
  @IsString()
  size: string;

  @ApiProperty({
    type: String,
    description: 'The UUID of the folder tied to the file',
    nullable: true,
  })
  @IsString()
  folder_id: string;

  @ApiProperty({
    type: String,
    description: 'The UUID of the permission tied to the file',
    nullable: true,
  })
  @IsString()
  permission: string | UnifiedFilestoragePermissionOutput;

  @ApiProperty({
    type: String,
    description: 'The UUID of the shared link tied to the file',
    nullable: true,
  })
  @IsString()
  shared_link: string | UnifiedFilestorageSharedlinkOutput;

  @ApiPropertyOptional({
    type: Object,
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
    description: 'The UUID of the file',
    nullable: true,
  })
  @IsUUID()
  @IsOptional()
  id?: string;

  @ApiPropertyOptional({
    type: String,
    description: 'The id of the file in the context of the 3rd Party',
    nullable: true,
  })
  @IsString()
  @IsOptional()
  remote_id?: string;

  @ApiPropertyOptional({
    type: Object,
    description: 'The remote data of the file in the context of the 3rd Party',
    nullable: true,
    additionalProperties: true,
  })
  @IsOptional()
  remote_data?: Record<string, any>;

  @ApiPropertyOptional({
    type: Date,
    description: 'The created date of the object',
    nullable: true,
  })
  @IsOptional()
  created_at?: Date;

  @ApiPropertyOptional({
    type: Date,
    description: 'The modified date of the object',
    nullable: true,
  })
  @IsOptional()
  modified_at?: Date;
}
