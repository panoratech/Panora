export class CreateContactDto {
  first_name: string;
  last_name: string;
  email_addresses: Email[];
  phone_numbers: Phone[];
}

export type Email = {
  email_address: string;
  email_address_type: string;
};

export type Phone = {
  phone_number: string;
  phone_type: string;
};

export type NormalizedContactInfo = {
  normalizedEmails: Email[];
  normalizedPhones: Phone[];
};
