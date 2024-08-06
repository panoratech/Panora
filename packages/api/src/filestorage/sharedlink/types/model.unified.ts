import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsUUID, IsOptional, IsString } from 'class-validator';
export class UnifiedFilestorageSharedlinkInput {
  @ApiPropertyOptional({
    type: String,
    nullable: true,
    example: 'https://example.com/my_shared_link',
    description: 'The url of the shared link',
  })
  @IsString()
  url?: string;

  @ApiPropertyOptional({
    type: String,
    nullable: true,
    example: 'https://example.com/my_shared_link.zip',
    description: 'The download url of the shared link',
  })
  @IsString()
  download_url?: string;

  @ApiPropertyOptional({
    type: String,
    nullable: true,
    example: '801f9ede-c698-4e66-a7fc-48d19eebaa4f',
    description: 'The UUID of the folder tied to the shared link',
  })
  @IsString()
  folder_id?: string;

  @ApiPropertyOptional({
    type: String,
    nullable: true,
    example: '801f9ede-c698-4e66-a7fc-48d19eebaa4f',
    description: 'The UUID of the file tied to the shared link',
  })
  @IsString()
  file_id?: string;

  @ApiPropertyOptional({
    type: String,
    nullable: true,
    example: 'can_create',
    description: 'The scope of the shared link',
  })
  @IsString()
  scope?: string;

  @ApiPropertyOptional({
    type: Boolean,
    nullable: true,
    example: true,
    description: 'If the shared link is protected by a password or not',
  })
  @IsString()
  password_protected?: boolean;

  @ApiPropertyOptional({
    type: String,
    example: 'password',
    nullable: true,
    description: 'The password of the shared link',
  })
  @IsString()
  password?: string;

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

export class UnifiedFilestorageSharedlinkOutput extends UnifiedFilestorageSharedlinkInput {
  @ApiPropertyOptional({
    type: String,
    nullable: true,
    example: '801f9ede-c698-4e66-a7fc-48d19eebaa4f',
    description: 'The UUID of the shared link',
  })
  @IsUUID()
  @IsOptional()
  id?: string;

  @ApiPropertyOptional({
    type: String,
    example: 'id_1',
    nullable: true,
    description: 'The id of the shared link in the context of the 3rd Party',
  })
  @IsString()
  @IsOptional()
  remote_id?: string;

  @ApiPropertyOptional({
    type: Object,
    nullable: true,
    example: {
      fav_dish: 'broccoli',
      fav_color: 'red',
    },
    additionalProperties: true,
    description:
      'The remote data of the shared link in the context of the 3rd Party',
  })
  @IsOptional()
  remote_data?: Record<string, any>;

  @ApiPropertyOptional({
    type: Date,
    nullable: true,
    example: '2024-10-01T12:00:00Z',
    description: 'The created date of the object',
  })
  @IsOptional()
  created_at?: Date;

  @ApiPropertyOptional({
    type: Date,
    nullable: true,
    example: '2024-10-01T12:00:00Z',
    description: 'The modified date of the object',
  })
  @IsOptional()
  modified_at?: Date;
}
