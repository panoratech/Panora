import { ApiPropertyOptional } from '@nestjs/swagger';
import { UnifiedAttachmentOutput } from '@ticketing/attachment/types/model.unified';

export class UnifiedCommentInput {
  body: string;
  html_body?: string;
  is_private?: boolean;
  creator_type: 'user' | 'contact' | null | string;
  ticket_id?: string; // uuid of Ticket object
  contact_id?: string; // uuid of Contact object
  user_id?: string; // uuid of User object
  attachments?: string[]; //uuids of Attachments objects
}

export class UnifiedCommentOutput {
  @ApiPropertyOptional({ description: 'The id of the comment', type: String })
  id?: string;
  @ApiPropertyOptional({
    description:
      'The id of the comment in the context of the Ticketing software',
    type: String,
  })
  remote_id?: string;
  remote_data?: Record<string, any>;
  body: string;
  html_body?: string;
  is_private?: boolean;
  created_at?: Date;
  modified_at?: Date;
  creator_type: 'user' | 'contact' | null | string;
  ticket_id?: string; // uuid of Ticket object
  contact_id?: string; // uuid of Contact object
  user_id?: string; // uuid of User object
  attachments?: UnifiedAttachmentOutput[]; // Attachments objects
}
