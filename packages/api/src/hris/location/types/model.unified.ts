import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsUUID,
  IsOptional,
  IsString,
  IsDateString,
  IsBoolean,
  IsIn,
} from 'class-validator';

export type LocationType = 'WORK' | 'HOME';
export class UnifiedHrisLocationInput {
  @ApiPropertyOptional({
    type: String,
    example: 'Headquarters',
    nullable: true,
    description: 'The name of the location',
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({
    type: String,
    example: '+1234567890',
    nullable: true,
    description: 'The phone number of the location',
  })
  @IsString()
  @IsOptional()
  phone_number?: string;

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
    example: 'Suite 456',
    nullable: true,
    description: 'The second line of the street address',
  })
  @IsString()
  @IsOptional()
  street_2?: string;

  @ApiPropertyOptional({
    type: String,
    example: 'San Francisco',
    nullable: true,
    description: 'The city of the location',
  })
  @IsString()
  @IsOptional()
  city?: string;

  @ApiPropertyOptional({
    type: String,
    example: 'CA',
    nullable: true,
    description: 'The state or region of the location',
  })
  @IsString()
  @IsOptional()
  state?: string;

  @ApiPropertyOptional({
    type: String,
    example: '94105',
    nullable: true,
    description: 'The zip or postal code of the location',
  })
  @IsString()
  @IsOptional()
  zip_code?: string;

  @ApiPropertyOptional({
    type: String,
    example: 'USA',
    nullable: true,
    description: 'The country of the location',
  })
  @IsString()
  @IsOptional()
  country?: string;

  @ApiPropertyOptional({
    type: String,
    example: 'WORK',
    enum: ['WORK', 'HOME'],
    nullable: true,
    description: 'The type of the location',
  })
  @IsString()
  @IsIn(['WORK', 'HOME'])
  @IsOptional()
  location_type?: LocationType | string;

  @ApiPropertyOptional({
    type: String,
    example: '801f9ede-c698-4e66-a7fc-48d19eebaa4f',
    nullable: true,
    description: 'The UUID of the company associated with the location',
  })
  @IsUUID()
  @IsOptional()
  company_id?: string;

  @ApiPropertyOptional({
    type: String,
    example: '801f9ede-c698-4e66-a7fc-48d19eebaa4f',
    nullable: true,
    description: 'The UUID of the employee associated with the location',
  })
  @IsUUID()
  @IsOptional()
  employee_id?: string;

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

export class UnifiedHrisLocationOutput extends UnifiedHrisLocationInput {
  @ApiPropertyOptional({
    type: String,
    example: '801f9ede-c698-4e66-a7fc-48d19eebaa4f',
    nullable: true,
    description: 'The UUID of the location record',
  })
  @IsUUID()
  @IsOptional()
  id?: string;

  @ApiPropertyOptional({
    type: String,
    example: 'location_1234',
    nullable: true,
    description:
      'The remote ID of the location in the context of the 3rd Party',
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
      'The remote data of the location in the context of the 3rd Party',
  })
  @IsOptional()
  remote_data?: Record<string, any>;

  @ApiPropertyOptional({
    type: Date,
    example: '2024-10-01T12:00:00Z',
    nullable: true,
    description:
      'The date when the location was created in the 3rd party system',
  })
  @IsDateString()
  @IsOptional()
  remote_created_at?: Date;

  @ApiPropertyOptional({
    type: Date,
    example: '2024-10-01T12:00:00Z',
    nullable: true,
    description: 'The created date of the location record',
  })
  @IsDateString()
  @IsOptional()
  created_at?: Date;

  @ApiPropertyOptional({
    type: Date,
    example: '2024-10-01T12:00:00Z',
    nullable: true,
    description: 'The last modified date of the location record',
  })
  @IsDateString()
  @IsOptional()
  modified_at?: Date;

  @ApiPropertyOptional({
    type: Boolean,
    example: false,
    nullable: true,
    description: 'Indicates if the location was deleted in the remote system',
  })
  @IsBoolean()
  @IsOptional()
  remote_was_deleted?: boolean;
}
