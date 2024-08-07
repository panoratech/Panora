import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsDateString,
  IsIn,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class UnifiedEcommerceProductInput {
  @ApiPropertyOptional({
    type: String,
    description: 'The URL of the product',
  })
  @IsString()
  @IsOptional()
  product_url?: string;

  @ApiPropertyOptional({
    type: String,
    description: 'The type of the product',
  })
  @IsString()
  @IsOptional()
  product_type?: string;

  @ApiPropertyOptional({
    type: String,
    description: 'The status of the product. Either ACTIVE, DRAFT OR ARCHIVED.',
  })
  @IsIn(['ARCHIVED', 'ACTIVE', 'DRAFT'])
  @IsOptional()
  product_status?: string;

  @ApiPropertyOptional({
    type: [String],
    description: 'The URLs of the product images',
  })
  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  images_urls?: string[];

  @ApiPropertyOptional({
    type: String,
    description: 'The description of the product',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    type: String,
    description: 'The vendor of the product',
  })
  @IsString()
  @IsOptional()
  vendor?: string;

  @ApiPropertyOptional({
    type: [Object],
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
    description: 'The tags associated with the product',
  })
  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({
    type: Object,
    description:
      'The custom field mappings of the object between the remote 3rd party & Panora',
  })
  @IsOptional()
  field_mappings?: Record<string, any>;
}

export class UnifiedEcommerceProductOutput extends UnifiedEcommerceProductInput {
  @ApiPropertyOptional({
    type: String,
    description: 'The UUID of the product',
  })
  @IsUUID()
  @IsOptional()
  id?: string;

  @ApiPropertyOptional({
    type: String,
    description: 'The remote ID of the product in the context of the 3rd Party',
  })
  @IsString()
  @IsOptional()
  remote_id: string;

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
