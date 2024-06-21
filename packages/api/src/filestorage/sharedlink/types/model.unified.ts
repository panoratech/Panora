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
}

export class UnifiedSharedLinkOutput extends UnifiedSharedLinkInput {
  @ApiPropertyOptional({
    type: String,
    description: 'The uuid of the shared link',
  })
  @IsUUID()
  @IsOptional()
  id?: string;
}
