import { Email, Phone } from '.';

export class UnifiedContactInput {
  first_name: string;
  last_name: string;
  email_addresses: Email[];
  phone_numbers: Phone[];
  field_mappings?: Record<string, any>[];
}

export class UnifiedContactOutput extends UnifiedContactInput {
  id?: string;
}
