import { Address, Email, Industry, Phone } from '@crm/@lib/@types';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class UnifiedCrmCompanyInput {
  @ApiPropertyOptional({
    type: String,
    example: 'Acme',
    description: 'The name of the company',
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({
    type: String,
    example: 'Software company',
    description: 'The description of the company',
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
    description: 'The custom field mappings of the company',
  })
  @IsOptional()
  field_mappings?: Record<string, any>;
}

export class UnifiedCrmCompanyOutput extends UnifiedCrmCompanyInput {
  @ApiPropertyOptional({
    type: String,
    example: '801f9ede-c698-4e66-a7fc-48d19eebaa4f',
    description: 'The UUID of the company',
  })
  @IsUUID()
  @IsOptional()
  id?: string;

  @ApiPropertyOptional({
    type: String,
    example: 'id_1',
    description: 'The remote ID of the company in the context of the 3rd Party',
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
    description:
      'The remote data of the company in the context of the 3rd Party',
  })
  @IsOptional()
  remote_data?: Record<string, any>;

  @ApiPropertyOptional({
    type: String,
    example: '2024-10-01T12:00:00Z',
    description: 'The created date of the company',
  })
  @IsOptional()
  created_at?: any;

  @ApiPropertyOptional({
    type: String,
    example: '2024-10-01T12:00:00Z',
    description: 'The modified date of the company',
  })
  @IsOptional()
  modified_at?: any;
}
