import { CurrencyCode } from '@@core/utils/types';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsUUID,
  IsOptional,
  IsString,
  IsDateString,
  IsInt,
  IsObject,
} from 'class-validator';

export class UnifiedEcommerceOrderInput {
  @ApiPropertyOptional({
    type: String,
    example: 'PAID',
    nullable: true,
    description: 'The status of the order',
  })
  @IsString()
  @IsOptional()
  order_status?: string;

  @ApiPropertyOptional({
    type: String,
    example: 19823838833,
    nullable: true,
    description: 'The number of the order',
  })
  @IsString()
  @IsOptional()
  order_number?: string;

  @ApiPropertyOptional({
    type: String,
    example: 'SUCCESS',
    enum: ['SUCCESS', 'FAIL'],
    nullable: true,
    description: 'The payment status of the order',
  })
  @IsString()
  @IsOptional()
  payment_status?: string;

  @ApiPropertyOptional({
    type: String,
    nullable: true,
    example: 'AUD',
    enum: CurrencyCode,
    description:
      'The currency of the order. Authorized value must be of type CurrencyCode (ISO 4217)',
  })
  @IsOptional()
  currency?: CurrencyCode;

  @ApiPropertyOptional({
    type: Number,
    example: 300,
    nullable: true,
    description: 'The total price of the order',
  })
  @IsInt()
  @IsOptional()
  total_price?: number;

  @ApiPropertyOptional({
    type: Number,
    example: 10,
    nullable: true,
    description: 'The total discount on the order',
  })
  @IsInt()
  @IsOptional()
  total_discount?: number;

  @ApiPropertyOptional({
    type: Number,
    example: 120,
    nullable: true,
    description: 'The total shipping cost of the order',
  })
  @IsInt()
  @IsOptional()
  total_shipping?: number;

  @ApiPropertyOptional({
    type: Number,
    example: 120,
    nullable: true,
    description: 'The total tax on the order',
  })
  @IsInt()
  @IsOptional()
  total_tax?: number;

  @ApiPropertyOptional({
    type: String,
    nullable: true,
    example: 'delivered',
    description: 'The fulfillment status of the order',
  })
  @IsString()
  @IsOptional()
  fulfillment_status?: string;

  @ApiPropertyOptional({
    type: String,
    example: '801f9ede-c698-4e66-a7fc-48d19eebaa4f',
    nullable: true,
    description: 'The UUID of the customer associated with the order',
  })
  @IsUUID()
  @IsOptional()
  customer_id?: string;

  @ApiPropertyOptional({
    type: Object,
    nullable: true,
    example: {},
    description: 'The items in the order',
  })
  @IsObject()
  @IsOptional()
  items?: Record<string, any>;

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

export class UnifiedEcommerceOrderOutput extends UnifiedEcommerceOrderInput {
  @ApiPropertyOptional({
    type: String,
    example: '801f9ede-c698-4e66-a7fc-48d19eebaa4f',
    nullable: true,
    description: 'The UUID of the order',
  })
  @IsUUID()
  @IsOptional()
  id?: string;

  @ApiPropertyOptional({
    type: String,
    example: 'id_1',
    nullable: true,
    description: 'The remote ID of the order in the context of the 3rd Party',
  })
  @IsString()
  @IsOptional()
  remote_id: string;

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
