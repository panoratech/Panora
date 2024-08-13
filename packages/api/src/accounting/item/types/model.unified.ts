import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsUUID,
  IsOptional,
  IsString,
  IsNumber,
  IsDateString,
} from 'class-validator';

export class UnifiedAccountingItemInput {
  @ApiPropertyOptional({
    type: String,
    example: 'Product A',
    nullable: true,
    description: 'The name of the accounting item',
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({
    type: String,
    example: 'Active',
    nullable: true,
    description: 'The status of the accounting item',
  })
  @IsString()
  @IsOptional()
  status?: string;

  @ApiPropertyOptional({
    type: Number,
    example: 1000,
    nullable: true,
    description: 'The unit price of the item in cents',
  })
  @IsNumber()
  @IsOptional()
  unit_price?: number;

  @ApiPropertyOptional({
    type: Number,
    example: 800,
    nullable: true,
    description: 'The purchase price of the item in cents',
  })
  @IsNumber()
  @IsOptional()
  purchase_price?: number;

  @ApiPropertyOptional({
    type: String,
    example: '801f9ede-c698-4e66-a7fc-48d19eebaa4f',
    nullable: true,
    description: 'The UUID of the associated sales account',
  })
  @IsUUID()
  @IsOptional()
  sales_account?: string;

  @ApiPropertyOptional({
    type: String,
    example: '801f9ede-c698-4e66-a7fc-48d19eebaa4f',
    nullable: true,
    description: 'The UUID of the associated purchase account',
  })
  @IsUUID()
  @IsOptional()
  purchase_account?: string;

  @ApiPropertyOptional({
    type: String,
    example: '801f9ede-c698-4e66-a7fc-48d19eebaa4f',
    nullable: true,
    description: 'The UUID of the associated company info',
  })
  @IsUUID()
  @IsOptional()
  company_info_id?: string;

  @ApiPropertyOptional({
    type: Object,
    example: {
      custom_field_1: 'value1',
      custom_field_2: 'value2',
    },
    nullable: true,
    description:
      'The custom field mappings of the object between the remote 3rd party & Panora',
  })
  @IsOptional()
  field_mappings?: Record<string, any>;
}

export class UnifiedAccountingItemOutput extends UnifiedAccountingItemInput {
  @ApiPropertyOptional({
    type: String,
    example: '801f9ede-c698-4e66-a7fc-48d19eebaa4f',
    nullable: true,
    description: 'The UUID of the accounting item record',
  })
  @IsUUID()
  @IsOptional()
  id?: string;

  @ApiPropertyOptional({
    type: String,
    example: 'item_1234',
    nullable: true,
    description: 'The remote ID of the item in the context of the 3rd Party',
  })
  @IsString()
  @IsOptional()
  remote_id?: string;

  @ApiPropertyOptional({
    type: Date,
    example: '2024-06-15T12:00:00Z',
    nullable: true,
    description: 'The date when the item was last updated in the remote system',
  })
  @IsDateString()
  @IsOptional()
  remote_updated_at?: Date;

  @ApiPropertyOptional({
    type: Object,
    example: {
      raw_data: {
        additional_field: 'some value',
      },
    },
    nullable: true,
    description: 'The remote data of the item in the context of the 3rd Party',
  })
  @IsOptional()
  remote_data?: Record<string, any>;

  @ApiPropertyOptional({
    type: Date,
    example: '2024-06-15T12:00:00Z',
    nullable: true,
    description: 'The created date of the accounting item record',
  })
  @IsDateString()
  @IsOptional()
  created_at?: Date;

  @ApiPropertyOptional({
    type: Date,
    example: '2024-06-15T12:00:00Z',
    nullable: true,
    description: 'The last modified date of the accounting item record',
  })
  @IsDateString()
  @IsOptional()
  modified_at?: Date;
}
