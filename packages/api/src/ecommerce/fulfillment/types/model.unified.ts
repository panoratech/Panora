import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsUUID,
  IsOptional,
  IsString,
  IsDateString,
  IsArray,
  IsObject,
} from 'class-validator';

export class UnifiedFulfilmentInput {
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
}

export class UnifiedFulfilmentOutput extends UnifiedFulfilmentInput {
  @ApiPropertyOptional({
    type: String,
    description: 'The UUID of the fulfilment',
  })
  @IsUUID()
  @IsOptional()
  id: string;

  @ApiPropertyOptional({
    type: String,
    description:
      'The remote ID of the fulfilment in the context of the 3rd Party',
  })
  @IsString()
  @IsOptional()
  remote_id?: string;

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
