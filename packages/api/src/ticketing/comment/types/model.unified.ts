import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UnifiedAttachmentOutput } from '@ticketing/attachment/types/model.unified';

export class UnifiedCommentInput {
  @ApiProperty({ description: 'The body of the comment' })
  body: string;

  @ApiPropertyOptional({ description: 'The html body of the comment' })
  html_body?: string;

  @ApiPropertyOptional({
    type: Boolean,
    description: 'The public status of the comment',
  })
  is_private?: boolean;

  @ApiPropertyOptional({
    description: 'The creator type of the comment (either user or contact)',
  })
  creator_type?: 'user' | 'contact';

  @ApiPropertyOptional({
    description: 'The uuid of the ticket the comment is tied to',
  })
  ticket_id?: string; // uuid of Ticket object

  @ApiPropertyOptional({
    description:
      'The uuid of the contact which the comment belongs to (if no user_id specified)',
  })
  contact_id?: string; // uuid of Contact object

  @ApiPropertyOptional({
    description:
      'The uuid of the user which the comment belongs to (if no contact_id specified)',
  })
  user_id?: string; // uuid of User object

  @ApiPropertyOptional({
    type: [String],
    description: 'The attachements uuids tied to the comment',
  })
  attachments?: any[]; //uuids of Attachments objects
}

export class UnifiedCommentOutput extends UnifiedCommentInput {
  @ApiPropertyOptional({ description: 'The uuid of the comment' })
  id?: string;

  @ApiPropertyOptional({
    description: 'The id of the comment in the context of the 3rd Party',
  })
  remote_id?: string;

  @ApiPropertyOptional({
    type: [{}],
    description:
      'The remote data of the comment in the context of the 3rd Party',
  })
  remote_data?: Record<string, any>;

  @ApiPropertyOptional({
    type: [UnifiedAttachmentOutput],
    description: 'The attachemnets tied to the comment',
  })
  attachments?: UnifiedAttachmentOutput[]; // Attachments objects
}
