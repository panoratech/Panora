import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UnifiedAttachmentOutput } from '@ticketing/attachment/types/model.unified';
import { IsBoolean, IsIn, IsOptional, IsString, IsUUID } from 'class-validator';

export class UnifiedCommentInput {
  @ApiProperty({ type: String, description: 'The body of the comment' })
  @IsString()
  body: string;

  @ApiPropertyOptional({
    type: String,
    description: 'The html body of the comment',
  })
  @IsString()
  @IsOptional()
  html_body?: string;

  @ApiPropertyOptional({
    type: Boolean,
    description: 'The public status of the comment',
  })
  @IsOptional()
  @IsBoolean()
  is_private?: boolean;

  @ApiPropertyOptional({
    type: String,
    description:
      'The creator type of the comment. Authorized values are either USER or CONTACT',
  })
  @IsIn(['USER', 'CONTACT'], {
    message: 'Type must be either USER or CONTACT',
  })
  @IsOptional()
  creator_type?: string;

  @ApiPropertyOptional({
    type: String,
    description: 'The uuid of the ticket the comment is tied to',
  })
  @IsUUID()
  @IsOptional()
  ticket_id?: string; // uuid of Ticket object

  @ApiPropertyOptional({
    type: String,
    description:
      'The uuid of the contact which the comment belongs to (if no user_id specified)',
  })
  @IsUUID()
  @IsOptional()
  contact_id?: string; // uuid of Contact object

  @ApiPropertyOptional({
    type: String,
    description:
      'The uuid of the user which the comment belongs to (if no contact_id specified)',
  })
  @IsUUID()
  @IsOptional()
  user_id?: string; // uuid of User object

  @ApiPropertyOptional({
    type: [String],
    description: 'The attachements uuids tied to the comment',
  })
  @IsOptional()
  attachments?: any[]; //uuids of Attachments objects
}

export class UnifiedCommentOutput extends UnifiedCommentInput {
  @ApiPropertyOptional({ type: String, description: 'The uuid of the comment' })
  @IsUUID()
  @IsOptional()
  id?: string;

  @ApiPropertyOptional({
    type: String,
    description: 'The id of the comment in the context of the 3rd Party',
  })
  @IsString()
  @IsOptional()
  remote_id?: string;

  @ApiPropertyOptional({
    type: {},
    description:
      'The remote data of the comment in the context of the 3rd Party',
  })
  @IsOptional()
  remote_data?: Record<string, any>;

  @ApiPropertyOptional({
    type: [UnifiedAttachmentOutput],
    description: 'The attachemnets tied to the comment',
  })
  @IsOptional()
  attachments?: UnifiedAttachmentOutput[]; // Attachments objects
}
