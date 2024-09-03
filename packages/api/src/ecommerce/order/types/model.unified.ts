import { CurrencyCode } from '@@core/utils/types';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsUUID,
  IsOptional,
  IsString,
  IsDateString,
  IsInt,
  IsObject,
  IsIn,
  IsEnum,
} from 'class-validator';

export class LineItem {
  remote_id: string | number; // Common and essential identifier
  product_id: string | number; // Identifier for the product
  variant_id?: string | number; // Identifier for the variant, optional as it's not always present
  sku: string | null; // Stock Keeping Unit, essential for inventory
  title: string; // Name or title of the product
  quantity: number; // Number of items ordered
  price: string; // Price per unit, critical for financials
  total: string; // Total price, often needed for order summaries
  fulfillment_status?: string; // Status of fulfillment, important for tracking
  requires_shipping: boolean; // Whether the item requires shipping
  taxable: boolean; // Whether the item is subject to tax
  weight?: number; // Weight of the item, important for shipping calculations
  variant_title?: string; // Title of the variant, optional but useful
  vendor?: string | null; // Vendor information, optional but useful
  properties?: { name: string; value: string }[]; // Custom properties, important for customization
  tax_lines?: {
    title: string;
    price: string;
    rate: number;
  }[]; // Tax details, essential for tax calculations
  discount_allocations?: {
    amount: string;
    discount_application_index: number;
  }[]; // Discount details, important for pricing
}

export type OrderStatus = 'PENDING' | 'UNSHIPPED' | 'SHIPPED' | 'CANCELED';
export type FulfillmentStatus = 'PENDING' | 'FULFILLED' | 'CANCELED';
export class UnifiedEcommerceOrderInput {
  @ApiPropertyOptional({
    type: String,
    example: 'UNSHIPPED',
    // enum: ['PENDING', 'UNSHIPPED', 'SHIPPED', 'CANCELED'],
    nullable: true,
    description: 'The status of the order',
  })
  //@IsIn(['PENDING', 'UNSHIPPED', 'SHIPPED', 'CANCELED'])
  @IsOptional()
  order_status?: OrderStatus | string;

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
    // enum: ['SUCCESS', 'FAIL'],
    nullable: true,
    description: 'The payment status of the order',
  })
  //@IsIn(['SUCCESS', 'FAIL'])
  @IsOptional()
  payment_status?: 'SUCCESS' | 'FAIL' | string;

  @ApiPropertyOptional({
    type: String,
    nullable: true,
    example: 'AUD',
    // enum: CurrencyCode,
    description:
      'The currency of the order. Authorized value must be of type CurrencyCode (ISO 4217)',
  })
  @IsEnum(CurrencyCode)
  @IsOptional()
  currency?: CurrencyCode;

  @ApiPropertyOptional({
    type: Number,
    example: 300,
    nullable: true,
    description: 'The total price of the order',
  })
  //@IsInt()
  @IsOptional()
  total_price?: number;

  @ApiPropertyOptional({
    type: Number,
    example: 10,
    nullable: true,
    description: 'The total discount on the order',
  })
  //@IsInt()
  @IsOptional()
  total_discount?: number;

  @ApiPropertyOptional({
    type: Number,
    example: 120,
    nullable: true,
    description: 'The total shipping cost of the order',
  })
  //@IsInt()
  @IsOptional()
  total_shipping?: number;

  @ApiPropertyOptional({
    type: Number,
    example: 120,
    nullable: true,
    description: 'The total tax on the order',
  })
  //@IsInt()
  @IsOptional()
  total_tax?: number;

  @ApiPropertyOptional({
    type: String,
    nullable: true,
    example: 'PENDING',
    // enum: ['PENDING', 'FULFILLED', 'CANCELED'],
    description: 'The fulfillment status of the order',
  })
  //@IsIn(['PENDING', 'FULFILLED', 'CANCELED'])
  @IsOptional()
  fulfillment_status?: FulfillmentStatus | string;

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
    type: [LineItem],
    nullable: true,
    example: [
      {
        remote_id: '12345',
        product_id: 'prod_001',
        variant_id: 'var_001',
        sku: 'SKU123',
        title: 'Sample Product',
        quantity: 2,
        price: '19.99',
        total: '39.98',
        fulfillment_status: 'PENDING',
        requires_shipping: true,
        taxable: true,
        weight: 1.5,
        variant_title: 'Size M',
        vendor: 'Sample Vendor',
        properties: [{ name: 'Color', value: 'Red' }],
        tax_lines: [{ title: 'Sales Tax', price: '3.00', rate: 0.075 }],
        discount_allocations: [
          { amount: '5.00', discount_application_index: 0 },
        ],
      },
    ],
    description: 'The items in the order',
  })
  @IsOptional()
  items?: Partial<LineItem>[];

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
