import { ApiPropertyOptional } from '@nestjs/swagger';

export class UnifiedCommentInput {
  body: string;
  html_body?: string;
  is_private?: boolean;
  created_at?: Date;
  modified_at?: Date;
  creator_type: 'user' | 'contact' | null | string;
  ticket_id?: string; // uuid of Ticket object
  contact_id?: string; // uuid of Contact object
  user_id?: string; // uuid of User object
  attachments?: string[]; //uuids of Attachments objects
}

//TODO: add remote_id
export class UnifiedCommentOutput extends UnifiedCommentInput {
  id?: string;
}
