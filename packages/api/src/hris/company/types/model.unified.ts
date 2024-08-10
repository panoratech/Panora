import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsUUID,
  IsOptional,
  IsString,
  IsArray,
  IsDateString,
  IsBoolean,
} from 'class-validator';

export class UnifiedHrisCompanyInput {
  @ApiPropertyOptional({
    type: String,
    example: 'Acme Corporation',
    nullable: true,
    description: 'The legal name of the company',
  })
  @IsString()
  @IsOptional()
  legal_name?: string;

  @ApiPropertyOptional({
    type: String,
    example: 'Acme Corp',
    nullable: true,
    description: 'The display name of the company',
  })
  @IsString()
  @IsOptional()
  display_name?: string;

  @ApiPropertyOptional({
    type: [String],
    example: ['12-3456789', '98-7654321'],
    nullable: true,
    description: 'The Employer Identification Numbers (EINs) of the company',
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  eins?: string[];

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

export class UnifiedHrisCompanyOutput extends UnifiedHrisCompanyInput {
  @ApiPropertyOptional({
    type: String,
    example: '801f9ede-c698-4e66-a7fc-48d19eebaa4f',
    nullable: true,
    description: 'The UUID of the company record',
  })
  @IsUUID()
  @IsOptional()
  id?: string;

  @ApiPropertyOptional({
    type: String,
    example: 'company_1234',
    nullable: true,
    description: 'The remote ID of the company in the context of the 3rd Party',
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
      'The remote data of the company in the context of the 3rd Party',
  })
  @IsOptional()
  remote_data?: Record<string, any>;

  @ApiPropertyOptional({
    type: String,
    example: '2024-10-01T12:00:00Z',
    nullable: true,
    description:
      'The date when the company was created in the 3rd party system',
  })
  @IsDateString()
  @IsOptional()
  remote_created_at?: string;

  @ApiPropertyOptional({
    type: String,
    example: '2024-10-01T12:00:00Z',
    nullable: true,
    description: 'The created date of the company record',
  })
  @IsDateString()
  @IsOptional()
  created_at?: string;

  @ApiPropertyOptional({
    type: String,
    example: '2024-10-01T12:00:00Z',
    nullable: true,
    description: 'The last modified date of the company record',
  })
  @IsDateString()
  @IsOptional()
  modified_at?: string;

  @ApiPropertyOptional({
    type: Boolean,
    example: false,
    nullable: true,
    description: 'Indicates if the company was deleted in the remote system',
  })
  @IsBoolean()
  @IsOptional()
  remote_was_deleted?: boolean;
}
