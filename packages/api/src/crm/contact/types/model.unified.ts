import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Email, Phone } from '.';

export class UnifiedContactInput {
  @ApiProperty({ description: 'The first name of the contact' })
  first_name: string;
  @ApiProperty({ description: 'The last name of the contact' })
  last_name: string;
  @ApiProperty({ type: [Email] })
  email_addresses: Email[];
  @ApiProperty({ type: [Phone] })
  phone_numbers: Phone[];
  @ApiPropertyOptional({ type: [{}] })
  field_mappings?: Record<string, any>[];
}

export class UnifiedContactOutput extends UnifiedContactInput {
  @ApiPropertyOptional({ description: 'The id of the contact' })
  id?: string;
  @ApiPropertyOptional({
    description: 'The id of the contact in the context of the Crm software',
  })
  remote_id?: string;
}
