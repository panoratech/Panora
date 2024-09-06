import { CurrencyCode } from '@@core/utils/types';
import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsUUID,
  IsOptional,
  IsString,
  IsNumber,
  IsDateString,
  IsArray,
  IsUrl,
  Min,
  Max,
} from 'class-validator';

export class UnifiedAccountingCompanyinfoInput {
  @ApiPropertyOptional({
    type: String,
    example: 'Acme Corporation',
    nullable: true,
    description: 'The name of the company',
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({
    type: String,
    example: 'Acme Corporation LLC',
    nullable: true,
    description: 'The legal name of the company',
  })
  @IsString()
  @IsOptional()
  legal_name?: string;

  @ApiPropertyOptional({
    type: String,
    example: '123456789',
    nullable: true,
    description: 'The tax number of the company',
  })
  @IsString()
  @IsOptional()
  tax_number?: string;

  @ApiPropertyOptional({
    type: Number,
    example: 12,
    nullable: true,
    description: 'The month of the fiscal year end (1-12)',
  })
  @IsNumber()
  @Min(1)
  @Max(12)
  @IsOptional()
  fiscal_year_end_month?: number;

  @ApiPropertyOptional({
    type: Number,
    example: 31,
    nullable: true,
    description: 'The day of the fiscal year end (1-31)',
  })
  @IsNumber()
  @Min(1)
  @Max(31)
  @IsOptional()
  fiscal_year_end_day?: number;

  @ApiPropertyOptional({
    type: String,
    example: 'USD',
    // enum: CurrencyCode,
    nullable: true,
    description: 'The currency used by the company',
  })
  @IsString()
  @IsOptional()
  currency?: CurrencyCode;

  @ApiPropertyOptional({
    type: [String],
    example: ['https://www.acmecorp.com', 'https://store.acmecorp.com'],
    nullable: true,
    description: 'The URLs associated with the company',
  })
  @IsArray()
  @IsUrl({}, { each: true })
  @IsOptional()
  urls?: string[];

  @ApiPropertyOptional({
    type: [String],
    example: [
      '801f9ede-c698-4e66-a7fc-48d19eebaa4f',
      '801f9ede-c698-4e66-a7fc-48d19eebaa4f',
    ],
    nullable: true,
    description: 'The UUIDs of the tracking categories used by the company',
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tracking_categories?: string[];

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

export class UnifiedAccountingCompanyinfoOutput extends UnifiedAccountingCompanyinfoInput {
  @ApiPropertyOptional({
    type: String,
    example: '801f9ede-c698-4e66-a7fc-48d19eebaa4f',
    nullable: true,
    description: 'The UUID of the company info record',
  })
  @IsUUID()
  @IsOptional()
  id?: string;

  @ApiPropertyOptional({
    type: String,
    example: 'company_1234',
    nullable: true,
    description:
      'The remote ID of the company info in the context of the 3rd Party',
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
      'The remote data of the company info in the context of the 3rd Party',
  })
  @IsOptional()
  remote_data?: Record<string, any>;

  @ApiPropertyOptional({
    type: Date,
    example: '2024-06-15T12:00:00Z',
    nullable: true,
    description:
      'The date when the company info was created in the remote system',
  })
  @IsDateString()
  @IsOptional()
  remote_created_at?: Date;

  @ApiPropertyOptional({
    type: Date,
    example: '2024-06-15T12:00:00Z',
    nullable: true,
    description: 'The created date of the company info record',
  })
  @IsDateString()
  @IsOptional()
  created_at?: Date;

  @ApiPropertyOptional({
    type: Date,
    example: '2024-06-15T12:00:00Z',
    nullable: true,
    description: 'The last modified date of the company info record',
  })
  @IsDateString()
  @IsOptional()
  modified_at?: Date;
}
