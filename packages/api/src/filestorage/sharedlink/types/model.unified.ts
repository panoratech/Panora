import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsUUID, IsOptional, IsString } from 'class-validator';
export class UnifiedSharedLinkInput {
  @ApiProperty({ type: String, description: 'The url of the shared link' })
  @IsString()
  url: string;

  @ApiProperty({
    type: String,
    description: 'The download url of the shared link',
  })
  @IsString()
  download_url: string;

  @ApiProperty({
    type: String,
    description: 'The uuid of the folder tied to the shared link',
  })
  @IsString()
  folder_id: string;

  @ApiProperty({
    type: String,
    description: 'The uuid of the file tied to the shared link',
  })
  @IsString()
  file_id: string;

  @ApiProperty({ type: String, description: 'The scope of the shared link' })
  @IsString()
  scope: string;

  @ApiProperty({
    type: Boolean,
    description: 'If the shared link is protected by a password or not',
  })
  @IsString()
  password_protected: boolean;

  @ApiProperty({ type: String, description: 'The password of the shared link' })
  @IsString()
  password: string;

  @ApiPropertyOptional({
    type: {},
    description:
      'The custom field mappings of the object between the remote 3rd party & Panora',
  })
  @IsOptional()
  field_mappings?: Record<string, any>;
}

export class UnifiedSharedLinkOutput extends UnifiedSharedLinkInput {
  @ApiPropertyOptional({
    type: String,
    description: 'The uuid of the shared link',
  })
  @IsUUID()
  @IsOptional()
  id?: string;

  @ApiPropertyOptional({
    type: String,
    description: 'The id of the shared link in the context of the 3rd Party',
  })
  @IsString()
  @IsOptional()
  remote_id?: string;

  @ApiPropertyOptional({
    type: {},
    description:
      'The remote data of the shared link in the context of the 3rd Party',
  })
  @IsOptional()
  remote_data?: Record<string, any>;
}
