import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsUUID,
  IsOptional,
  IsString,
  IsNumber,
  IsDateString,
} from 'class-validator';

export class UnifiedAccountingTaxrateInput {
  @ApiPropertyOptional({
    type: String,
    example: 'VAT 20%',
    nullable: true,
    description: 'The description of the tax rate',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    type: Number,
    example: 2000,
    nullable: true,
    description: 'The total tax rate in basis points (e.g., 2000 for 20%)',
  })
  @IsNumber()
  @IsOptional()
  total_tax_ratge?: number;

  @ApiPropertyOptional({
    type: Number,
    example: 1900,
    nullable: true,
    description: 'The effective tax rate in basis points (e.g., 1900 for 19%)',
  })
  @IsNumber()
  @IsOptional()
  effective_tax_rate?: number;

  @ApiPropertyOptional({
    type: String,
    example: '801f9ede-c698-4e66-a7fc-48d19eebaa4f',
    nullable: true,
    description: 'The UUID of the associated company',
  })
  @IsUUID()
  @IsOptional()
  company_id?: string;

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

export class UnifiedAccountingTaxrateOutput extends UnifiedAccountingTaxrateInput {
  @ApiPropertyOptional({
    type: String,
    example: '801f9ede-c698-4e66-a7fc-48d19eebaa4f',
    nullable: true,
    description: 'The UUID of the tax rate record',
  })
  @IsUUID()
  @IsOptional()
  id?: string;

  @ApiPropertyOptional({
    type: String,
    example: 'tax_rate_1234',
    nullable: true,
    description:
      'The remote ID of the tax rate in the context of the 3rd Party',
  })
  @IsString()
  @IsOptional()
  remote_id?: string;

  @ApiPropertyOptional({
    type: Object,
    example: {
      raw_data: {
        additional_field: 'some value',
      },
    },
    nullable: true,
    description:
      'The remote data of the tax rate in the context of the 3rd Party',
  })
  @IsOptional()
  remote_data?: Record<string, any>;

  @ApiPropertyOptional({
    type: Date,
    example: '2024-06-15T12:00:00Z',
    nullable: true,
    description: 'The created date of the tax rate record',
  })
  @IsDateString()
  @IsOptional()
  created_at?: Date;

  @ApiPropertyOptional({
    type: Date,
    example: '2024-06-15T12:00:00Z',
    nullable: true,
    description: 'The last modified date of the tax rate record',
  })
  @IsDateString()
  @IsOptional()
  modified_at?: Date;
}
