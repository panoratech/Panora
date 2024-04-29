import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UnifiedCommentInput } from '@ticketing/comment/types/model.unified';
import { IsIn, IsOptional, IsString } from 'class-validator';

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
  status?: string;

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
  @IsIn(['PROBLEM', 'QUESTION', 'TASK'], {
    message: 'Type must be either PROBLEM, QUESTION or TASK',
  })
  @IsOptional()
  type?: string;

  @ApiPropertyOptional({
    type: String,
    description: 'The uuid of the parent ticket',
  })
  @IsString()
  @IsOptional()
  parent_ticket?: string;

  @ApiPropertyOptional({
    type: String,
    description: 'The uuid of the project the ticket belongs to',
  })
  @IsString()
  @IsOptional()
  project_id?: string;

  @ApiPropertyOptional({
    type: [String],
    description: 'The tags names of the ticket',
  })
  @IsOptional()
  tags?: string[]; // tags names

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
  priority?: string;

  @ApiPropertyOptional({
    type: [String],
    description: 'The users uuids the ticket is assigned to',
  })
  @IsOptional()
  assigned_to?: string[]; //uuid of Users objects ?

  @ApiPropertyOptional({
    type: UnifiedCommentInput,
    description: 'The comment of the ticket',
  })
  @IsOptional()
  comment?: UnifiedCommentInput;

  @ApiPropertyOptional({
    type: String,
    description: 'The uuid of the account which the ticket belongs to',
  })
  @IsString()
  @IsOptional()
  account_id?: string;

  @ApiPropertyOptional({
    type: String,
    description: 'The uuid of the contact which the ticket belongs to',
  })
  @IsString()
  @IsOptional()
  contact_id?: string;

  @ApiPropertyOptional({
    type: {},
    description:
      'The custom field mappings of the ticket between the remote 3rd party & Panora',
  })
  @IsOptional()
  field_mappings?: Record<string, any>;
}
export class UnifiedTicketOutput extends UnifiedTicketInput {
  @ApiPropertyOptional({ type: String, description: 'The uuid of the ticket' })
  @IsString()
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
}
