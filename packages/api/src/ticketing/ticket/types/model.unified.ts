import { ApiPropertyOptional } from '@nestjs/swagger';
import { Comment } from '@ticketing/ticket/types';

export class UnifiedTicketInput {
  name: string;
  status?: string;
  description: string;
  due_date?: Date;
  type?: string;
  parent_ticket?: string;
  tags?: string;
  completed_at?: Date;
  priority?: string;
  assigned_to?: string[];
  comments?: Comment[];
  @ApiPropertyOptional({ type: [{}] })
  field_mappings?: Record<string, any>[];
}

export class UnifiedTicketOutput extends UnifiedTicketInput {
  @ApiPropertyOptional()
  id?: string;
}
