import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UnifiedCommentInput } from '@ticketing/comment/types/model.unified';

export class UnifiedTicketInput {
  name: string;
  status?: string;
  description: string;
  due_date?: Date;
  type?: string;
  parent_ticket?: string;
  tags?: string; // TODO: create a real Tag object here
  completed_at?: Date;
  priority?: string;
  assigned_to?: string[]; //uuid of Users objects ?
  comment?: UnifiedCommentInput;
  account_id?: string;
  contact_id?: string;
  field_mappings?: Record<string, any>[];
}
export class UnifiedTicketOutput extends UnifiedTicketInput {
  @ApiProperty()
  id: string;
}
