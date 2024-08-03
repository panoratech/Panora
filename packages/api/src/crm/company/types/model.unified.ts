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
  @ApiProperty({
    type: String,
    description: 'The name of the company',
    nullable: true,
  })
  @IsString()
  name: string;

  @ApiPropertyOptional({
    type: String,
    description:
      'The industry of the company. Authorized values can be found in the Industry enum.',
    nullable: true,
  })
  @IsEnum(Industry)
  @IsOptional()
  industry?: Industry | string;

  @ApiPropertyOptional({
    type: Number,
    description: 'The number of employees of the company',
    nullable: true,
  })
  @IsNumber()
  @IsOptional()
  number_of_employees?: number;

  @ApiPropertyOptional({
    type: String,
    description: 'The UUID of the user who owns the company',
    nullable: true,
  })
  @IsOptional()
  @IsUUID()
  user_id?: string;

  @ApiPropertyOptional({
    description: 'The email addresses of the company',
    type: [Email],
    nullable: true,
  })
  @IsOptional()
  email_addresses?: Email[];

  @ApiPropertyOptional({
    description: 'The addresses of the company',
    type: [Address],
    nullable: true,
  })
  @IsOptional()
  addresses?: Address[];

  @ApiPropertyOptional({
    description: 'The phone numbers of the company',
    type: [Phone],
    nullable: true,
  })
  @IsOptional()
  phone_numbers?: Phone[];

  @ApiPropertyOptional({
    type: Object,
    description:
      'The custom field mappings of the company between the remote 3rd party & Panora',
    nullable: true,
    additionalProperties: true,
  })
  @IsOptional()
  field_mappings?: Record<string, any>;
}

export class UnifiedCrmCompanyOutput extends UnifiedCrmCompanyInput {
  @ApiPropertyOptional({
    type: String,
    description: 'The UUID of the company',
    nullable: true,
  })
  @IsUUID()
  @IsOptional()
  id?: string;

  @ApiPropertyOptional({
    type: String,
    description: 'The id of the company in the context of the Crm 3rd Party',
    nullable: true,
  })
  @IsString()
  @IsOptional()
  remote_id?: string;

  @ApiPropertyOptional({
    type: Object,
    description:
      'The remote data of the company in the context of the Crm 3rd Party',
    nullable: true,
    additionalProperties: true,
  })
  @IsOptional()
  remote_data?: Record<string, any>;

  @ApiPropertyOptional({
    type: Object,
    description: 'The created date of the object',
    nullable: true,
  })
  @IsOptional()
  created_at?: Date;

  @ApiPropertyOptional({
    type: Object,
    description: 'The modified date of the object',
    nullable: true,
  })
  @IsOptional()
  modified_at?: Date;
}
