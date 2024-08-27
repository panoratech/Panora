import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsDateString,
  IsIn,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class Variant {
  title: string;
  price: number;
  sku: string;
  options: any;
  weight: number;
  inventory_quantity: number;
}
export class UnifiedEcommerceProductInput {
  @ApiPropertyOptional({
    type: String,
    example: 'https://product_url/tee',
    nullable: true,
    description: 'The URL of the product',
  })
  @IsString()
  @IsOptional()
  product_url?: string;

  @ApiPropertyOptional({
    type: String,
    example: 'teeshirt',
    nullable: true,
    description: 'The type of the product',
  })
  @IsString()
  @IsOptional()
  product_type?: string;

  @ApiPropertyOptional({
    type: String,
    example: 'ACTIVE',
    nullable: true,
    // enum: ['ARCHIVED', 'ACTIVE', 'DRAFT'],
    description: 'The status of the product. Either ACTIVE, DRAFT OR ARCHIVED.',
  })
  //@IsIn(['ARCHIVED', 'ACTIVE', 'DRAFT'])
  @IsOptional()
  product_status?: string;

  @ApiPropertyOptional({
    type: [String],
    example: ['https://myproduct/image'],
    nullable: true,
    description: 'The URLs of the product images',
  })
  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  images_urls?: string[];

  @ApiPropertyOptional({
    type: String,
    example: 'best tee ever',
    nullable: true,
    description: 'The description of the product',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    type: String,
    example: 'vendor_extern',
    nullable: true,
    description: 'The vendor of the product',
  })
  @IsString()
  @IsOptional()
  vendor?: string;

  @ApiPropertyOptional({
    type: [Variant],
    example: [
      {
        title: 'teeshirt',
        price: 20,
        sku: '3',
        options: null,
        weight: 10,
        inventory_quantity: 100,
      },
    ],
    description: 'The variants of the product',
  })
  @IsOptional()
  variants?: {
    title: string;
    price: number;
    sku: string;
    options: any;
    weight: number;
    inventory_quantity: number;
  }[];

  @ApiPropertyOptional({
    type: [String],
    example: ['tag_1'],
    nullable: true,
    description: 'The tags associated with the product',
  })
  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  tags?: string[];

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

export class UnifiedEcommerceProductOutput extends UnifiedEcommerceProductInput {
  @ApiPropertyOptional({
    type: String,
    example: '801f9ede-c698-4e66-a7fc-48d19eebaa4f',
    nullable: true,
    description: 'The UUID of the product',
  })
  @IsUUID()
  @IsOptional()
  id?: string;

  @ApiPropertyOptional({
    type: String,
    example: 'id_1',
    nullable: true,
    description: 'The remote ID of the product in the context of the 3rd Party',
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
