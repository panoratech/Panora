import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsUUID,
  IsOptional,
  IsString,
  IsDateString,
  IsIn,
} from 'class-validator';

export type AttachmentType =
  | 'RESUME'
  | 'COVER_LETTER'
  | 'OFFER_LETTER'
  | 'OTHER';
export class UnifiedAttachmentInput {
  @ApiPropertyOptional({ type: String, description: 'The URL of the file' })
  @IsString()
  @IsOptional()
  file_url?: string;

  @ApiPropertyOptional({ type: String, description: 'The name of the file' })
  @IsString()
  @IsOptional()
  file_name?: string;

  @ApiPropertyOptional({ type: String, description: 'The type of the file' })
  @IsIn(['RESUME', 'COVER_LETTER', 'OFFER_LETTER', 'OTHER'])
  @IsOptional()
  attachment_type?: AttachmentType | string;

  @ApiPropertyOptional({
    type: String,
    format: 'date-time',
    description: 'The remote creation date of the attachment',
  })
  @IsDateString()
  @IsOptional()
  remote_created_at?: string;

  @ApiPropertyOptional({
    type: String,
    format: 'date-time',
    description: 'The remote modification date of the attachment',
  })
  @IsDateString()
  @IsOptional()
  remote_modified_at?: string;

  @ApiPropertyOptional({
    type: String,
    description: 'The UUID of the candidate',
  })
  @IsUUID()
  @IsOptional()
  candidate_id?: string;

  @ApiPropertyOptional({
    type: {},
    description:
      'The custom field mappings of the object between the remote 3rd party & Panora',
  })
  @IsOptional()
  field_mappings?: Record<string, any>;
}

export class UnifiedAttachmentOutput extends UnifiedAttachmentInput {
  @ApiPropertyOptional({
    type: String,
    description: 'The UUID of the attachment',
  })
  @IsUUID()
  @IsOptional()
  id?: string;

  @ApiPropertyOptional({
    type: String,
    description: 'The remote ID of the attachment',
  })
  @IsString()
  @IsOptional()
  remote_id?: string;

  @ApiPropertyOptional({
    type: {},
    description:
      'The remote data of the attachment in the context of the 3rd Party',
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
