import {
  ApiProperty,
  ApiPropertyOptional,
  getSchemaPath,
} from '@nestjs/swagger';
import { UnifiedTicketingAttachmentInput } from '@ticketing/attachment/types/model.unified';
import { UnifiedTicketingCollectionOutput } from '@ticketing/collection/types/model.unified';
import { UnifiedTicketingCommentInput } from '@ticketing/comment/types/model.unified';
import { UnifiedTicketingTagOutput } from '@ticketing/tag/types/model.unified';
import { IsIn, IsOptional, IsString, IsUUID } from 'class-validator';

export type TicketType = 'BUG' | 'SUBTASK' | 'TASK' | 'TO-DO';
export type TicketStatus = 'OPEN' | 'CLOSED';
export type TicketPriority = 'HIGH' | 'MEDIUM' | 'LOW';

export class UnifiedTicketingTicketInput {
  @ApiProperty({
    type: String,
    example: 'Customer Service Inquiry',
    nullable: true,
    description: 'The name of the ticket',
  })
  @IsString()
  name: string;

  @ApiPropertyOptional({
    type: String,
    example: 'OPEN',
    // enum: ['OPEN', 'CLOSED'],
    nullable: true,
    description:
      'The status of the ticket. Authorized values are OPEN or CLOSED.',
  })
  /*@IsIn(['OPEN', 'CLOSED'], {
    message: 'Type must be either OPEN or CLOSED',
  })*/
  @IsOptional()
  status?: TicketStatus | string;

  @ApiProperty({
    type: String,
    example: 'Help customer',
    nullable: true,
    description: 'The description of the ticket',
  })
  @IsString()
  description: string;

  @ApiPropertyOptional({
    type: Date,
    example: '2024-10-01T12:00:00Z',
    nullable: true,
    description: 'The date the ticket is due',
  })
  @IsOptional()
  due_date?: Date;

  @ApiPropertyOptional({
    type: String,
    example: 'BUG',
    // enum: ['BUG', 'SUBTASK', 'TASK', 'TO-DO'],
    nullable: true,
    description:
      'The type of the ticket. Authorized values are PROBLEM, QUESTION, or TASK',
  })
  /*@IsIn(['BUG', 'SUBTASK', 'TASK', 'TO-DO'], {
    message: 'Type must be either BUG, SUBTASK, TASK or TO-DO',
  })*/
  @IsOptional()
  type?: TicketType | string;

  @ApiPropertyOptional({
    type: String,
    example: '801f9ede-c698-4e66-a7fc-48d19eebaa4f',
    nullable: true,
    description: 'The UUID of the parent ticket',
  })
  @IsUUID()
  @IsOptional()
  parent_ticket?: string;

  @ApiPropertyOptional({
    type: 'array',
    items: {
      oneOf: [
        { type: 'string' },
        { $ref: getSchemaPath(UnifiedTicketingCollectionOutput) },
      ],
    },
    example: ['801f9ede-c698-4e66-a7fc-48d19eebaa4f'],
    nullable: true,
    description: 'The collection UUIDs the ticket belongs to',
  })
  @IsUUID()
  @IsOptional()
  collections?: (string | UnifiedTicketingCollectionOutput)[];

  @ApiPropertyOptional({
    type: 'array',
    items: {
      oneOf: [
        { type: 'string' },
        { $ref: getSchemaPath(UnifiedTicketingTagOutput) },
      ],
    },
    example: ['my_tag', 'urgent_tag'],
    nullable: true,
    description: 'The tags names of the ticket',
  })
  @IsOptional()
  tags?: (string | UnifiedTicketingTagOutput)[];

  @ApiPropertyOptional({
    type: Date,
    example: '2024-10-01T12:00:00Z',
    nullable: true,
    description: 'The date the ticket has been completed',
  })
  @IsOptional()
  completed_at?: Date;

  @ApiPropertyOptional({
    type: String,
    example: 'HIGH',
    // enum: ['HIGH', 'MEDIUM', 'LOW'],
    nullable: true,
    description:
      'The priority of the ticket. Authorized values are HIGH, MEDIUM or LOW.',
  })
  /*@IsIn(['HIGH', 'MEDIUM', 'LOW'], {
    message: 'Type must be either HIGH, MEDIUM or LOW',
  })*/
  @IsOptional()
  priority?: TicketPriority | string;

  @ApiPropertyOptional({
    type: [String],
    example: ['801f9ede-c698-4e66-a7fc-48d19eebaa4f'],
    nullable: true,
    description: 'The users UUIDs the ticket is assigned to',
  })
  @IsOptional()
  assigned_to?: string[];

  @ApiPropertyOptional({
    type: UnifiedTicketingCommentInput,
    example: {
      content: 'Assigned the issue !',
    },
    nullable: true,
    description: 'The comment of the ticket',
  })
  @IsOptional()
  comment?: UnifiedTicketingCommentInput;

  @ApiPropertyOptional({
    type: String,
    example: '801f9ede-c698-4e66-a7fc-48d19eebaa4f',
    nullable: true,
    description: 'The UUID of the account which the ticket belongs to',
  })
  @IsUUID()
  @IsOptional()
  account_id?: string;

  @ApiPropertyOptional({
    type: String,
    example: '801f9ede-c698-4e66-a7fc-48d19eebaa4f',
    nullable: true,
    description: 'The UUID of the contact which the ticket belongs to',
  })
  @IsUUID()
  @IsOptional()
  contact_id?: string;

  @ApiPropertyOptional({
    type: 'array',
    items: {
      oneOf: [
        { type: 'string' },
        { $ref: getSchemaPath(UnifiedTicketingAttachmentInput) },
      ],
    },
    example: ['801f9ede-c698-4e66-a7fc-48d19eebaa4f'],
    description: 'The attachements UUIDs tied to the ticket',
    nullable: true,
  })
  @IsOptional()
  attachments?: (string | UnifiedTicketingAttachmentInput)[];

  @ApiPropertyOptional({
    type: Object,
    example: {
      fav_dish: 'broccoli',
      fav_color: 'red',
    },
    nullable: true,
    description:
      'The custom field mappings of the ticket between the remote 3rd party & Panora',
    additionalProperties: true,
  })
  @IsOptional()
  field_mappings?: Record<string, any>;
}
export class UnifiedTicketingTicketOutput extends UnifiedTicketingTicketInput {
  @ApiPropertyOptional({
    type: String,
    example: '801f9ede-c698-4e66-a7fc-48d19eebaa4f',
    nullable: true,
    description: 'The UUID of the ticket',
  })
  @IsUUID()
  @IsOptional()
  id?: string;

  @ApiPropertyOptional({
    type: String,
    example: 'id_1',
    nullable: true,
    description: 'The id of the ticket in the context of the 3rd Party',
  })
  @IsString()
  @IsOptional()
  remote_id?: string;

  @ApiPropertyOptional({
    type: Object,
    example: { key1: 'value1', key2: 42, key3: true },
    nullable: true,
    additionalProperties: true,
    description:
      'The remote data of the ticket in the context of the 3rd Party',
  })
  @IsOptional()
  remote_data?: Record<string, any>;

  @ApiPropertyOptional({
    example: '2024-10-01T12:00:00Z',
    type: Date,
    nullable: true,
    description: 'The created date of the object',
  })
  @IsOptional()
  created_at?: Date;

  @ApiPropertyOptional({
    example: '2024-10-01T12:00:00Z',
    type: Date,
    nullable: true,
    description: 'The modified date of the object',
  })
  @IsOptional()
  modified_at?: Date;
}
