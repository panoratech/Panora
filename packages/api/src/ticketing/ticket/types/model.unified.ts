import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UnifiedCommentInput } from '@ticketing/comment/types/model.unified';

export class UnifiedTicketInput {
  @ApiProperty({
    description: 'The name of the ticket',
  })
  name: string;

  @ApiPropertyOptional({
    description: 'The status of the ticket',
  })
  status?: string;

  @ApiProperty({
    type: [String],
    description: 'The description of the ticket',
  })
  description: string;

  @ApiPropertyOptional({
    type: Date,
    description: 'The date the ticket is due',
  })
  due_date?: Date;

  @ApiPropertyOptional({
    description: 'The type of the ticket',
  })
  type?: string;

  @ApiPropertyOptional({
    description: 'The uuid of the parent ticket',
  })
  parent_ticket?: string;

  @ApiPropertyOptional({
    type: [String],
    description: 'The tags names of the ticket',
  })
  tags?: string[]; // tags names

  @ApiPropertyOptional({
    type: Date,
    description: 'The date the ticket has been completed',
  })
  completed_at?: Date;

  @ApiPropertyOptional({
    description: 'The priority of the ticket',
  })
  priority?: string;

  @ApiPropertyOptional({
    type: [String],
    description: 'The users uuids the ticket is assigned to',
  })
  assigned_to?: string[]; //uuid of Users objects ?

  @ApiPropertyOptional({
    type: [String],
    description: 'The users uuids the ticket is assigned to',
  })
  comment?: UnifiedCommentInput;

  @ApiPropertyOptional({
    description: 'The uuid of the account which the ticket belongs to',
  })
  account_id?: string;

  @ApiPropertyOptional({
    description: 'The uuid of the contact which the ticket belongs to',
  })
  contact_id?: string;

  @ApiPropertyOptional({
    type: [{}],
    description:
      'The custom field mappings of the ticket between the remote 3rd party & Panora',
  })
  field_mappings?: Record<string, any>[];
}
export class UnifiedTicketOutput extends UnifiedTicketInput {
  @ApiPropertyOptional({ description: 'The uuid of the ticket' })
  id?: string;

  @ApiPropertyOptional({
    description: 'The id of the ticket in the context of the 3rd Party',
  })
  remote_id?: string;

  @ApiPropertyOptional({
    type: [{}],
    description:
      'The remote data of the ticket in the context of the 3rd Party',
  })
  remote_data?: Record<string, any>;
}
