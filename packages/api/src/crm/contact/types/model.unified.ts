import { Address, Email, Phone } from '@crm/@utils/@types';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID } from 'class-validator';

export class UnifiedContactInput {
  @ApiProperty({ type: String, description: 'The first name of the contact' })
  @IsString()
  first_name: string;

  @ApiProperty({ type: String, description: 'The last name of the contact' })
  @IsString()
  last_name: string;

  @ApiPropertyOptional({
    type: [Email],
    description: 'The email addresses of the contact',
  })
  email_addresses: Email[];

  @ApiPropertyOptional({
    type: [Phone],
    description: 'The phone numbers of the contact',
  })
  phone_numbers: Phone[];

  @ApiPropertyOptional({
    type: [Address],
    description: 'The addresses of the contact',
  })
  addresses: Address[];

  @ApiPropertyOptional({
    type: String,
    description: 'The uuid of the user who owns the contact',
  })
  @IsUUID()
  @IsOptional()
  user_id?: string;

  @ApiPropertyOptional({
    type: {},
    description:
      'The custom field mappings of the contact between the remote 3rd party & Panora',
  })
  @IsOptional()
  field_mappings?: Record<string, any>;
}

export class UnifiedContactOutput extends UnifiedContactInput {
  @ApiPropertyOptional({ type: String, description: 'The uuid of the contact' })
  @IsUUID()
  @IsOptional()
  id?: string;

  @ApiPropertyOptional({
    type: String,
    description: 'The id of the contact in the context of the Crm 3rd Party',
  })
  @IsString()
  @IsOptional()
  remote_id?: string;

  @ApiPropertyOptional({
    type: {},
    description:
      'The remote data of the contact in the context of the Crm 3rd Party',
  })
  @IsOptional()
  remote_data?: Record<string, any>;
}
