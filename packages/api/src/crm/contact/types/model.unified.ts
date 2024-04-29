import { Address, Email, Phone } from '@crm/@utils/@types';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UnifiedContactInput {
  @ApiProperty({ description: 'The first name of the contact' })
  first_name: string;

  @ApiProperty({ description: 'The last name of the contact' })
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
  user_id?: string;

  @ApiPropertyOptional({
    type: {},
    description:
      'The custom field mappings of the contact between the remote 3rd party & Panora',
  })
  field_mappings?: Record<string, any>;
}

export class UnifiedContactOutput extends UnifiedContactInput {
  @ApiPropertyOptional({ description: 'The uuid of the contact' })
  id?: string;

  @ApiPropertyOptional({
    description: 'The id of the contact in the context of the Crm 3rd Party',
  })
  remote_id?: string;

  @ApiPropertyOptional({
    type: [{}],
    description:
      'The remote data of the contact in the context of the Crm 3rd Party',
  })
  remote_data?: Record<string, any>;
}
