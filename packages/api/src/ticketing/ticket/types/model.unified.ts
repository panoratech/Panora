import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UnifiedAttachmentInput } from '@ticketing/attachment/types/model.unified';
import { UnifiedCollectionOutput } from '@ticketing/collection/types/model.unified';
import { UnifiedCommentInput } from '@ticketing/comment/types/model.unified';
import { UnifiedTagOutput } from '@ticketing/tag/types/model.unified';
import { IsIn, IsOptional, IsString, IsUUID } from 'class-validator';

export type TicketType = 'BUG' | 'SUBTASK' | 'TASK' | 'TO-DO';
export type TicketStatus = 'OPEN' | 'CLOSED';
export type TicketPriority = 'HIGH' | 'MEDIUM' | 'LOW';

export class UnifiedTicketInput {
  @ApiProperty({
    type: String,
    description: 'The name of the ticket',
  })
  @IsString()
  name: string;

  @ApiPropertyOptional({
    type: String,
    description:
      'The status of the ticket. Authorized values are OPEN or CLOSED.',
  })
  @IsIn(['OPEN', 'CLOSED'], {
    message: 'Type must be either OPEN or CLOSED',
  })
  @IsOptional()
  status?: TicketStatus | string;

  @ApiProperty({
    type: String,
    description: 'The description of the ticket',
  })
  @IsString()
  description: string;

  @ApiPropertyOptional({
    type: Date,
    description: 'The date the ticket is due',
  })
  @IsOptional()
  due_date?: Date;

  @ApiPropertyOptional({
    type: String,
    description:
      'The type of the ticket. Authorized values are PROBLEM, QUESTION, or TASK',
  })
  @IsIn(['BUG', 'SUBTASK', 'TASK', 'TO-DO'], {
    message: 'Type must be either BUG, SUBTASK, TASK or TO-DO',
  })
  @IsOptional()
  type?: TicketType | string;

  @ApiPropertyOptional({
    type: String,
    description: 'The UUID of the parent ticket',
  })
  @IsUUID()
  @IsOptional()
  parent_ticket?: string;

  @ApiPropertyOptional({
    type: String,
    description: 'The collection UUIDs the ticket belongs to',
  })
  @IsUUID()
  @IsOptional()
  collections?: (string | UnifiedCollectionOutput)[];

  @ApiPropertyOptional({
    type: [String],
    description: 'The tags names of the ticket',
  })
  @IsOptional()
  tags?: (string | UnifiedTagOutput)[]; // tags names

  @ApiPropertyOptional({
    type: Date,
    description: 'The date the ticket has been completed',
  })
  @IsOptional()
  completed_at?: Date;

  @ApiPropertyOptional({
    type: String,
    description:
      'The priority of the ticket. Authorized values are HIGH, MEDIUM or LOW.',
  })
  @IsIn(['HIGH', 'MEDIUM', 'LOW'], {
    message: 'Type must be either HIGH, MEDIUM or LOW',
  })
  @IsOptional()
  priority?: TicketPriority | string;

  @ApiPropertyOptional({
    type: [String],
    description: 'The users UUIDs the ticket is assigned to',
  })
  @IsOptional()
  assigned_to?: string[]; //UUID of Users objects ?

  @ApiPropertyOptional({
    type: UnifiedCommentInput,
    description: 'The comment of the ticket',
  })
  @IsOptional()
  comment?: UnifiedCommentInput;

  @ApiPropertyOptional({
    type: String,
    description: 'The UUID of the account which the ticket belongs to',
  })
  @IsUUID()
  @IsOptional()
  account_id?: string;

  @ApiPropertyOptional({
    type: String,
    description: 'The UUID of the contact which the ticket belongs to',
  })
  @IsUUID()
  @IsOptional()
  contact_id?: string;

  // optional but may exist if ticket contains attachments
  @ApiPropertyOptional({
    type: [String],
    description: 'The attachements UUIDs tied to the ticket',
  })
  @IsOptional()
  attachments?: (string | UnifiedAttachmentInput)[];

  @ApiPropertyOptional({
    type: {},
    description:
      'The custom field mappings of the ticket between the remote 3rd party & Panora',
  })
  @IsOptional()
  field_mappings?: Record<string, any>;
}
export class UnifiedTicketOutput extends UnifiedTicketInput {
  @ApiPropertyOptional({ type: String, description: 'The UUID of the ticket' })
  @IsUUID()
  @IsOptional()
  id?: string;

  @ApiPropertyOptional({
    type: String,
    description: 'The id of the ticket in the context of the 3rd Party',
  })
  @IsString()
  @IsOptional()
  remote_id?: string;

  @ApiPropertyOptional({
    type: {},
    description:
      'The remote data of the ticket in the context of the 3rd Party',
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
