import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsDateString,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class UnifiedProductInput {
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
    description: 'The status of the product',
  })
  @IsString()
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
}

export class UnifiedProductOutput extends UnifiedProductInput {
  @ApiPropertyOptional({
    type: String,
    description: 'The UUID of the product',
  })
  @IsUUID()
  @IsOptional()
  id: string;

  @ApiPropertyOptional({
    type: String,
    description: 'The remote ID of the product in the context of the 3rd Party',
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
