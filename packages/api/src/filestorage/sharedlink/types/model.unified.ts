import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsUUID, IsOptional, IsString } from 'class-validator';
export class UnifiedSharedLinkInput {
  @ApiPropertyOptional({
    type: String,
    description: 'The url of the shared link',
  })
  @IsString()
  url?: string;

  @ApiPropertyOptional({
    type: String,
    description: 'The download url of the shared link',
  })
  @IsString()
  download_url?: string;

  @ApiPropertyOptional({
    type: String,
    description: 'The UUID of the folder tied to the shared link',
  })
  @IsString()
  folder_id?: string;

  @ApiPropertyOptional({
    type: String,
    description: 'The UUID of the file tied to the shared link',
  })
  @IsString()
  file_id?: string;

  @ApiPropertyOptional({
    type: String,
    description: 'The scope of the shared link',
  })
  @IsString()
  scope?: string;

  @ApiPropertyOptional({
    type: Boolean,
    description: 'If the shared link is protected by a password or not',
  })
  @IsString()
  password_protected?: boolean;

  @ApiPropertyOptional({
    type: String,
    description: 'The password of the shared link',
  })
  @IsString()
  password?: string;

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
    description: 'The UUID of the shared link',
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
