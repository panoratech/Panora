import { Email, Phone } from '../types';

export class CreateContactDto {
  first_name: string;
  last_name: string;
  email_addresses: Email[];
  phone_numbers: Phone[];
}
