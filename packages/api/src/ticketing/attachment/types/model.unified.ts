import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID } from 'class-validator';

export class UnifiedAttachmentInput {
  @ApiProperty({ type: String, description: 'The file name of the attachment' })
  @IsString()
  file_name: string;

  @ApiProperty({ type: String, description: 'The file url of the attachment' })
  @IsString()
  file_url: string;

  @ApiProperty({
    type: String,
    description: "The uploader's UUID of the attachment",
  })
  @IsString()
  @IsOptional()
  uploader?: string;

  @ApiPropertyOptional({
    type: String,
    description: 'The UUID of the ticket the attachment is tied to',
  })
  @IsUUID()
  @IsOptional()
  ticket_id?: string; // UUID of Ticket object

  @ApiPropertyOptional({
    type: String,
    description: 'The UUID of the comment the attachment is tied to',
  })
  @IsUUID()
  @IsOptional()
  comment_id?: string; // UUID of Comment object

  @ApiPropertyOptional({
    type: {},
    description:
      'The custom field mappings of the attachment between the remote 3rd party & Panora',
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
    description: 'The id of the attachment in the context of the 3rd Party',
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
