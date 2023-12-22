import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UnifiedContactOutput } from './model.unified';

export class Email {
  @ApiProperty({
    description: 'The email address of a contact',
  })
  email_address: string;
  @ApiProperty({
    description: 'The email address type of a contact',
  })
  email_address_type: string;
  @ApiPropertyOptional({
    description: 'The owner type of a the email tied to the contact',
  })
  owner_type?: string;
}

export class Phone {
  @ApiProperty({
    description: 'The phone number of a contact',
  })
  phone_number: string;
  @ApiProperty({
    description: 'The phone type of a contact',
  })
  phone_type: string;
  @ApiPropertyOptional()
  owner_type?: string;
}

export type NormalizedContactInfo = {
  normalizedEmails: Email[];
  normalizedPhones: Phone[];
};

export class ContactResponse {
  @ApiProperty({ type: [UnifiedContactOutput] })
  contacts: UnifiedContactOutput[];
  @ApiPropertyOptional({ type: [{}] })
  remote_data?: Record<string, any>[]; //data in original format
}
