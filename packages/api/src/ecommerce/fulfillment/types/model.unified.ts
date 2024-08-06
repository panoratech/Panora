import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsUUID,
  IsOptional,
  IsString,
  IsDateString,
  IsArray,
  IsObject,
} from 'class-validator';

export class UnifiedEcommerceFulfilmentInput {
  @ApiPropertyOptional({
    type: String,
    description: 'The carrier of the fulfilment',
  })
  @IsString()
  @IsOptional()
  carrier?: string;

  @ApiPropertyOptional({
    type: [String],
    description: 'The tracking URLs of the fulfilment',
  })
  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  tracking_urls?: string[];

  @ApiPropertyOptional({
    type: [String],
    description: 'The tracking numbers of the fulfilment',
  })
  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  tracking_numbers?: string[];

  @ApiPropertyOptional({
    type: Object,
    description: 'The items in the fulfilment',
  })
  @IsObject()
  @IsOptional()
  items?: Record<string, any>;

  @ApiPropertyOptional({
    type: String,
    description: 'The UUID of the order associated with the fulfilment',
  })
  @IsUUID()
  @IsOptional()
  order_id?: string;

  @ApiPropertyOptional({
    type: Object,
    description:
      'The custom field mappings of the object between the remote 3rd party & Panora',
  })
  @IsOptional()
  field_mappings?: Record<string, any>;
}

export class UnifiedEcommerceFulfilmentOutput extends UnifiedEcommerceFulfilmentInput {
  @ApiPropertyOptional({
    type: String,
    description: 'The UUID of the fulfilment',
  })
  @IsUUID()
  @IsOptional()
  id?: string;

  @ApiPropertyOptional({
    type: String,
    description:
      'The remote ID of the fulfilment in the context of the 3rd Party',
  })
  @IsString()
  @IsOptional()
  remote_id?: string;

  @ApiPropertyOptional({
    type: Object,
    description:
      'The remote data of the customer in the context of the 3rd Party',
  })
  @IsOptional()
  remote_data?: Record<string, any>;

  @ApiPropertyOptional({
    type: String,
    description: 'The created date of the object',
  })
  @IsDateString()
  @IsOptional()
  created_at?: string;

  @ApiPropertyOptional({
    type: String,
    description: 'The modified date of the object',
  })
  @IsDateString()
  @IsOptional()
  modified_at?: string;
}
