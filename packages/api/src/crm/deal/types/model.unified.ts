import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';

export class UnifiedCrmDealInput {
  @ApiPropertyOptional({
    type: String,
    example: 'Contract to close',
    description: 'The name of the deal',
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({
    type: Number,
    example: 1000,
    description: 'The amount of the deal',
  })
  @IsNumber()
  @IsOptional()
  amount?: number;

  @ApiPropertyOptional({
    type: String,
    example: 'Contract with a healthcare company',
    description: 'The description of the deal',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    type: Object,
    example: {
      fav_dish: 'broccoli',
      fav_color: 'red',
    },
    description: 'The custom field mappings of the deal',
  })
  @IsOptional()
  field_mappings?: Record<string, any>;
}

export class UnifiedCrmDealOutput extends UnifiedCrmDealInput {
  @ApiPropertyOptional({
    type: String,
    example: '801f9ede-c698-4e66-a7fc-48d19eebaa4f',
    description: 'The UUID of the deal',
  })
  @IsUUID()
  @IsOptional()
  id?: string;

  @ApiPropertyOptional({
    type: String,
    example: 'id_1',
    description: 'The remote ID of the deal in the context of the 3rd Party',
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
    description: 'The remote data of the deal in the context of the 3rd Party',
  })
  @IsOptional()
  remote_data?: Record<string, any>;

  @ApiPropertyOptional({
    type: String,
    example: '2024-10-01T12:00:00Z',
    description: 'The created date of the deal',
  })
  @IsOptional()
  created_at?: any;

  @ApiPropertyOptional({
    type: String,
    example: '2024-10-01T12:00:00Z',
    description: 'The modified date of the deal',
  })
  @IsOptional()
  modified_at?: any;
}
