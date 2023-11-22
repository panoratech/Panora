import { Email, Phone } from '../types';

export class UnifiedContactInput {
  first_name: string;
  last_name: string;
  email_addresses: Email[];
  phone_numbers: Phone[];
}

export class UnifiedContactOutput extends UnifiedContactInput {}
