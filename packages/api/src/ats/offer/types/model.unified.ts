import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsUUID,
  IsOptional,
  IsString,
  IsDateString,
  IsIn,
} from 'class-validator';

export type OfferStatus =
  | 'DRAFT'
  | 'APPROVAL_SENT'
  | 'APPROVED'
  | 'SENT'
  | 'SENT_MANUALLY'
  | 'OPENED'
  | 'DENIED'
  | 'SIGNED'
  | 'DEPRECATED';
export class UnifiedAtsOfferInput {
  @ApiPropertyOptional({
    type: String,
    example: '801f9ede-c698-4e66-a7fc-48d19eebaa4f',
    description: 'The UUID of the creator',
  })
  @IsUUID()
  @IsOptional()
  created_by?: string;

  @ApiPropertyOptional({
    type: String,
    format: 'date-time',
    example: '2024-10-01T12:00:00Z',
    description: 'The remote creation date of the offer',
  })
  @IsDateString()
  @IsOptional()
  remote_created_at?: string;

  @ApiPropertyOptional({
    type: String,
    format: 'date-time',
    example: '2024-10-01T12:00:00Z',
    description: 'The closing date of the offer',
  })
  @IsDateString()
  @IsOptional()
  closed_at?: string;

  @ApiPropertyOptional({
    type: String,
    format: 'date-time',
    example: '2024-10-01T12:00:00Z',
    description: 'The sending date of the offer',
  })
  @IsDateString()
  @IsOptional()
  sent_at?: string;

  @ApiPropertyOptional({
    type: String,
    format: 'date-time',
    example: '2024-10-01T12:00:00Z',
    description: 'The start date of the offer',
  })
  @IsDateString()
  @IsOptional()
  start_date?: string;

  @ApiPropertyOptional({
    type: String,
    example: 'DRAFT',
    enum: [
      'DRAFT',
      'APPROVAL_SENT',
      'APPROVED',
      'SENT',
      'SENT_MANUALLY',
      'OPENED',
      'DENIED',
      'SIGNED',
      'DEPRECATED',
    ],
    description: 'The status of the offer',
  })
  @IsIn([
    'DRAFT',
    'APPROVAL_SENT',
    'APPROVED',
    'SENT',
    'SENT_MANUALLY',
    'OPENED',
    'DENIED',
    'SIGNED',
    'DEPRECATED',
  ])
  @IsOptional()
  status?: OfferStatus | string;

  @ApiPropertyOptional({
    type: String,
    example: '801f9ede-c698-4e66-a7fc-48d19eebaa4f',
    description: 'The UUID of the application',
  })
  @IsUUID()
  @IsOptional()
  application_id?: string;

  @ApiPropertyOptional({
    type: Object,
    example: {
      fav_dish: 'broccoli',
      fav_color: 'red',
    },
    description:
      'The custom field mappings of the object between the remote 3rd party & Panora',
  })
  @IsOptional()
  field_mappings?: Record<string, any>;
}

export class UnifiedAtsOfferOutput extends UnifiedAtsOfferInput {
  @ApiPropertyOptional({
    type: String,
    example: '801f9ede-c698-4e66-a7fc-48d19eebaa4f',
    description: 'The UUID of the offer',
  })
  @IsUUID()
  @IsOptional()
  id?: string;

  @ApiPropertyOptional({
    type: String,
    example: 'id_1',
    description: 'The remote ID of the offer in the context of the 3rd Party',
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
    description: 'The remote data of the offer in the context of the 3rd Party',
  })
  @IsOptional()
  remote_data?: Record<string, any>;

  @ApiPropertyOptional({
    type: {},
    example: '2024-10-01T12:00:00Z',
    description: 'The created date of the object',
  })
  @IsOptional()
  created_at?: any;

  @ApiPropertyOptional({
    type: {},
    example: '2024-10-01T12:00:00Z',
    description: 'The modified date of the object',
  })
  @IsOptional()
  modified_at?: any;
}
