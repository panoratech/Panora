import {
  ApiProperty,
  ApiPropertyOptional,
  getSchemaPath,
} from '@nestjs/swagger';
import { UnifiedTicketingAttachmentOutput } from '@ticketing/attachment/types/model.unified';
import { IsBoolean, IsIn, IsOptional, IsString, IsUUID } from 'class-validator';

export type CommentCreatorType = 'USER' | 'CONTACT';

export class UnifiedTicketingCommentInput {
  @ApiProperty({
    type: String,
    nullable: true,
    example: 'Assigned to Eric !',
    description: 'The body of the comment',
  })
  @IsString()
  body: string;

  @ApiPropertyOptional({
    type: String,
    nullable: true,
    example: '<p>Assigned to Eric !</p>',
    description: 'The html body of the comment',
  })
  @IsString()
  @IsOptional()
  html_body?: string;

  @ApiPropertyOptional({
    type: Boolean,
    nullable: true,
    example: false,
    description: 'The public status of the comment',
  })
  @IsOptional()
  @IsBoolean()
  is_private?: boolean;

  @ApiPropertyOptional({
    type: String,
    nullable: true,
    example: 'USER',
    // enum: ['USER', 'CONTACT'],
    description:
      'The creator type of the comment. Authorized values are either USER or CONTACT',
  })
  /*@IsIn(['USER', 'CONTACT'], {
    message: 'Type must be either USER or CONTACT',
  })*/
  @IsOptional()
  creator_type?: CommentCreatorType | string;

  @ApiPropertyOptional({
    type: String,
    nullable: true,
    example: '801f9ede-c698-4e66-a7fc-48d19eebaa4f',
    description: 'The UUID of the ticket the comment is tied to',
  })
  @IsUUID()
  @IsOptional()
  ticket_id?: string; // UUID of Ticket object

  @ApiPropertyOptional({
    type: String,
    nullable: true,
    example: '801f9ede-c698-4e66-a7fc-48d19eebaa4f',
    description:
      'The UUID of the contact which the comment belongs to (if no user_id specified)',
  })
  @IsUUID()
  @IsOptional()
  contact_id?: string; // UUID of Contact object

  @ApiPropertyOptional({
    type: String,
    nullable: true,
    example: '801f9ede-c698-4e66-a7fc-48d19eebaa4f',
    description:
      'The UUID of the user which the comment belongs to (if no contact_id specified)',
  })
  @IsUUID()
  @IsOptional()
  user_id?: string; // UUID of User object

  @ApiPropertyOptional({
    type: 'array',
    items: {
      oneOf: [
        { type: 'string' },
        { $ref: getSchemaPath(UnifiedTicketingAttachmentOutput) },
      ],
    },
    nullable: true,
    example: ['801f9ede-c698-4e66-a7fc-48d19eebaa4f'],
    description: 'The attachements UUIDs tied to the comment',
  })
  @IsOptional()
  attachments?: (string | UnifiedTicketingAttachmentOutput)[]; //UUIDs of Attachments objects
}

export class UnifiedTicketingCommentOutput extends UnifiedTicketingCommentInput {
  @ApiPropertyOptional({
    type: String,
    nullable: true,
    example: '801f9ede-c698-4e66-a7fc-48d19eebaa4f',
    description: 'The UUID of the comment',
  })
  @IsUUID()
  @IsOptional()
  id?: string;

  @ApiPropertyOptional({
    type: String,
    nullable: true,
    example: 'id_1',
    description: 'The id of the comment in the context of the 3rd Party',
  })
  @IsString()
  @IsOptional()
  remote_id?: string;

  @ApiPropertyOptional({
    type: Object,
    nullable: true,
    example: {
      fav_dish: 'broccoli',
      fav_color: 'red',
    },
    additionalProperties: true,
    description:
      'The remote data of the comment in the context of the 3rd Party',
  })
  @IsOptional()
  remote_data?: Record<string, any>;

  @ApiPropertyOptional({
    type: Date,
    nullable: true,
    example: '2024-10-01T12:00:00Z',
    description: 'The created date of the object',
  })
  @IsOptional()
  created_at?: Date;

  @ApiPropertyOptional({
    type: Date,
    nullable: true,
    example: '2024-10-01T12:00:00Z',
    description: 'The modified date of the object',
  })
  @IsOptional()
  modified_at?: Date;
}
