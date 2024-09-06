import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsUUID,
  IsOptional,
  IsString,
  IsDateString,
  IsArray,
  IsObject,
} from 'class-validator';

export class UnifiedEcommerceFulfillmentInput {
  @ApiPropertyOptional({
    type: String,
    nullable: true,
    example: 'DHL',
    description: 'The carrier of the fulfilment',
  })
  @IsString()
  @IsOptional()
  carrier?: string;

  @ApiPropertyOptional({
    type: [String],
    nullable: true,
    example: ['https://tracing-url.sf.com'],
    description: 'The tracking URLs of the fulfilment',
  })
  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  tracking_urls?: string[];

  @ApiPropertyOptional({
    type: [String],
    nullable: true,
    example: ['track_1029_191919'],
    description: 'The tracking numbers of the fulfilment',
  })
  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  tracking_numbers?: string[];

  @ApiPropertyOptional({
    type: Object,
    nullable: true,
    example: {},
    description: 'The items in the fulfilment',
  })
  @IsObject()
  @IsOptional()
  items?: Record<string, any>;

  @ApiPropertyOptional({
    type: String,
    example: '801f9ede-c698-4e66-a7fc-48d19eebaa4f',
    nullable: true,
    description: 'The UUID of the order associated with the fulfilment',
  })
  @IsUUID()
  @IsOptional()
  order_id?: string;

  @ApiPropertyOptional({
    type: Object,
    example: {
      fav_dish: 'broccoli',
      fav_color: 'red',
    },
    nullable: true,
    description:
      'The custom field mappings of the object between the remote 3rd party & Panora',
  })
  @IsOptional()
  field_mappings?: Record<string, any>;
}

export class UnifiedEcommerceFulfillmentOutput extends UnifiedEcommerceFulfillmentInput {
  @ApiPropertyOptional({
    type: String,
    example: '801f9ede-c698-4e66-a7fc-48d19eebaa4f',
    nullable: true,
    description: 'The UUID of the fulfilment',
  })
  @IsUUID()
  @IsOptional()
  id?: string;

  @ApiPropertyOptional({
    type: String,
    example: 'id_1',
    nullable: true,
    description:
      'The remote ID of the fulfilment in the context of the 3rd Party',
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
    nullable: true,
    description:
      'The remote data of the customer in the context of the 3rd Party',
  })
  @IsOptional()
  remote_data?: Record<string, any>;

  @ApiPropertyOptional({
    type: String,
    example: '2024-10-01T12:00:00Z',
    nullable: true,
    description: 'The created date of the object',
  })
  @IsDateString()
  @IsOptional()
  created_at?: string;

  @ApiPropertyOptional({
    type: String,
    example: '2024-10-01T12:00:00Z',
    nullable: true,
    description: 'The modified date of the object',
  })
  @IsDateString()
  @IsOptional()
  modified_at?: string;
}
