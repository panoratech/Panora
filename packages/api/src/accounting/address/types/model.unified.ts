import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsUUID, IsOptional, IsString, IsDateString } from 'class-validator';

export class UnifiedAccountingAddressInput {
  @ApiPropertyOptional({
    type: String,
    example: 'Billing',
    nullable: true,
    description: 'The type of the address',
  })
  @IsString()
  @IsOptional()
  type?: string;

  @ApiPropertyOptional({
    type: String,
    example: '123 Main St',
    nullable: true,
    description: 'The first line of the street address',
  })
  @IsString()
  @IsOptional()
  street_1?: string;

  @ApiPropertyOptional({
    type: String,
    example: 'Apt 4B',
    nullable: true,
    description: 'The second line of the street address',
  })
  @IsString()
  @IsOptional()
  street_2?: string;

  @ApiPropertyOptional({
    type: String,
    example: 'New York',
    nullable: true,
    description: 'The city of the address',
  })
  @IsString()
  @IsOptional()
  city?: string;

  @ApiPropertyOptional({
    type: String,
    example: 'NY',
    nullable: true,
    description: 'The state of the address',
  })
  @IsString()
  @IsOptional()
  state?: string;

  @ApiPropertyOptional({
    type: String,
    example: 'New York',
    nullable: true,
    description:
      'The country subdivision (e.g., province or state) of the address',
  })
  @IsString()
  @IsOptional()
  country_subdivision?: string;

  @ApiPropertyOptional({
    type: String,
    example: 'USA',
    nullable: true,
    description: 'The country of the address',
  })
  @IsString()
  @IsOptional()
  country?: string;

  @ApiPropertyOptional({
    type: String,
    example: '10001',
    nullable: true,
    description: 'The zip or postal code of the address',
  })
  @IsString()
  @IsOptional()
  zip?: string;

  @ApiPropertyOptional({
    type: String,
    example: '801f9ede-c698-4e66-a7fc-48d19eebaa4f',
    nullable: true,
    description: 'The UUID of the associated contact',
  })
  @IsUUID()
  @IsOptional()
  contact_id?: string;

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

export class UnifiedAccountingAddressOutput extends UnifiedAccountingAddressInput {
  @ApiPropertyOptional({
    type: String,
    example: '801f9ede-c698-4e66-a7fc-48d19eebaa4f',
    nullable: true,
    description: 'The UUID of the address record',
  })
  @IsUUID()
  @IsOptional()
  id?: string;

  @ApiPropertyOptional({
    type: String,
    example: 'address_1234',
    nullable: true,
    description: 'The remote ID of the address in the context of the 3rd Party',
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
      'The remote data of the address in the context of the 3rd Party',
  })
  @IsOptional()
  remote_data?: Record<string, any>;

  @ApiPropertyOptional({
    type: Date,
    example: '2024-06-15T12:00:00Z',
    nullable: true,
    description: 'The created date of the address record',
  })
  @IsDateString()
  @IsOptional()
  created_at?: Date;

  @ApiPropertyOptional({
    type: Date,
    example: '2024-06-15T12:00:00Z',
    nullable: true,
    description: 'The last modified date of the address record',
  })
  @IsDateString()
  @IsOptional()
  modified_at?: Date;
}
