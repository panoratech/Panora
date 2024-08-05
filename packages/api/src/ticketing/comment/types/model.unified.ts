import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UnifiedTicketingAttachmentOutput } from '@ticketing/attachment/types/model.unified';
import { IsBoolean, IsIn, IsOptional, IsString, IsUUID } from 'class-validator';

export type CommentCreatorType = 'USER' | 'CONTACT';

export class UnifiedTicketingCommentInput {
  @ApiProperty({
    type: String,
    example: 'Assigned the issue !',
    description: 'The content of the comment',
  })
  @IsString()
  content: string;

  @ApiPropertyOptional({
    type: Object,
    example: {
      fav_dish: 'broccoli',
      fav_color: 'red',
    },
    description: 'The custom field mappings of the comment',
  })
  @IsOptional()
  field_mappings?: Record<string, any>;
}

export class UnifiedTicketingCommentOutput extends UnifiedTicketingCommentInput {
  @ApiPropertyOptional({
    type: String,
    example: '801f9ede-c698-4e66-a7fc-48d19eebaa4f',
    description: 'The UUID of the comment',
  })
  @IsUUID()
  @IsOptional()
  id?: string;

  @ApiPropertyOptional({
    type: String,
    example: 'id_1',
    description: 'The remote ID of the comment in the context of the 3rd Party',
  })
  @IsString()
  @IsOptional()
  remote_id?: string;

  @ApiPropertyOptional({
    type: Object,
    example: {
      fav_dish: 'broccoli',
      fav_color: 'red',
    },
    description:
      'The remote data of the comment in the context of the 3rd Party',
  })
  @IsOptional()
  remote_data?: Record<string, any>;

  @ApiPropertyOptional({
    type: {},
    example: '2024-10-01T12:00:00Z',
    description: 'The created date of the comment',
  })
  @IsOptional()
  created_at?: any;

  @ApiPropertyOptional({
    type: {},
    example: '2024-10-01T12:00:00Z',
    description: 'The modified date of the comment',
  })
  @IsOptional()
  modified_at?: any;
}
