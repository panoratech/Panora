import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsUUID,
  IsOptional,
  IsString,
  IsDateString,
  IsInt,
} from 'class-validator';

export class UnifiedOrderInput {
  @ApiPropertyOptional({
    type: String,
    description: 'The status of the order',
  })
  @IsString()
  @IsOptional()
  order_status?: string;

  @ApiPropertyOptional({
    type: String,
    description: 'The number of the order',
  })
  @IsString()
  @IsOptional()
  order_number?: string;

  @ApiPropertyOptional({
    type: String,
    description: 'The payment status of the order',
  })
  @IsString()
  @IsOptional()
  payment_status?: string;

  @ApiPropertyOptional({
    type: String,
    description: 'The currency of the order',
  })
  @IsString()
  @IsOptional()
  currency?: string;

  @ApiPropertyOptional({
    type: Number,
    description: 'The total price of the order',
  })
  @IsInt()
  @IsOptional()
  total_price?: number;

  @ApiPropertyOptional({
    type: Number,
    description: 'The total discount on the order',
  })
  @IsInt()
  @IsOptional()
  total_discount?: number;

  @ApiPropertyOptional({
    type: Number,
    description: 'The total shipping cost of the order',
  })
  @IsInt()
  @IsOptional()
  total_shipping?: number;

  @ApiPropertyOptional({
    type: Number,
    description: 'The total tax on the order',
  })
  @IsInt()
  @IsOptional()
  total_tax?: number;

  @ApiPropertyOptional({
    type: String,
    description: 'The fulfillment status of the order',
  })
  @IsString()
  @IsOptional()
  fulfillment_status?: string;

  @ApiPropertyOptional({
    type: String,
    description: 'The UUID of the customer associated with the order',
  })
  @IsUUID()
  @IsOptional()
  customer_id?: string;
}

export class UnifiedOrderOutput extends UnifiedOrderInput {
  @ApiPropertyOptional({
    type: String,
    description: 'The UUID of the order',
  })
  @IsUUID()
  @IsOptional()
  id: string;

  @ApiPropertyOptional({
    type: String,
    description: 'The remote ID of the order in the context of the 3rd Party',
  })
  @IsString()
  @IsOptional()
  remote_id: string;

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
