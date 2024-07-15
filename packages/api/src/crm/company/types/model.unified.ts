import { Address, Email, Industry, Phone } from '@crm/@lib/@types';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class UnifiedCompanyInput {
  @ApiProperty({ type: String, description: 'The name of the company' })
  @IsString()
  name: string;

  @ApiPropertyOptional({
    type: String,
    description:
      'The industry of the company. Authorized values can be found in the Industry enum.',
  })
  @IsEnum(Industry)
  @IsOptional()
  industry?: Industry | string;

  @ApiPropertyOptional({
    type: Number,
    description: 'The number of employees of the company',
  })
  @IsNumber()
  @IsOptional()
  number_of_employees?: number;

  @ApiPropertyOptional({
    type: String,
    description: 'The UUID of the user who owns the company',
  })
  @IsOptional()
  @IsUUID()
  user_id?: string;

  @ApiPropertyOptional({
    description: 'The email addresses of the company',
    type: [Email],
  })
  @IsOptional()
  email_addresses?: Email[];

  @ApiPropertyOptional({
    description: 'The addresses of the company',
    type: [Address],
  })
  @IsOptional()
  addresses?: Address[];

  @ApiPropertyOptional({
    description: 'The phone numbers of the company',
    type: [Phone],
  })
  @IsOptional()
  phone_numbers?: Phone[];

  @ApiPropertyOptional({
    type: {},
    description:
      'The custom field mappings of the company between the remote 3rd party & Panora',
  })
  @IsOptional()
  field_mappings?: Record<string, any>;
}

export class UnifiedCompanyOutput extends UnifiedCompanyInput {
  @ApiPropertyOptional({ type: String, description: 'The UUID of the company' })
  @IsUUID()
  @IsOptional()
  id?: string;

  @ApiPropertyOptional({
    type: String,
    description: 'The id of the company in the context of the Crm 3rd Party',
  })
  @IsString()
  @IsOptional()
  remote_id?: string;

  @ApiPropertyOptional({
    type: {},
    description:
      'The remote data of the company in the context of the Crm 3rd Party',
  })
  @IsOptional()
  remote_data?: Record<string, any>;

  @ApiPropertyOptional({
    type: {},
    description: 'The created date of the object',
  })
  @IsOptional()
  created_at?: any;

  @ApiPropertyOptional({
    type: {},
    description: 'The modified date of the object',
  })
  @IsOptional()
  modified_at?: any;
}
