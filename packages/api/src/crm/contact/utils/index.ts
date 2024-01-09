import { Email, Phone } from '@crm/@utils/@types';
import { v4 as uuidv4 } from 'uuid';

export function normalizeEmailsAndNumbers(
  email_addresses: Email[],
  phone_numbers: Phone[],
) {
  const normalizedEmails = email_addresses.map((email) => ({
    ...email,
    owner_type: email.owner_type ? email.owner_type : '',
    created_at: new Date(),
    modified_at: new Date(),
    id_crm_email: uuidv4(), // This line is changed
    email_address_type:
      email.email_address_type === '' ? 'work' : email.email_address_type,
  }));

  const normalizedPhones = phone_numbers.map((phone) => ({
    ...phone,
    owner_type: phone.owner_type ? phone.owner_type : '',
    created_at: new Date(),
    modified_at: new Date(),
    id_crm_phone_number: uuidv4(), // This line is changed
    phone_type: phone.phone_type === '' ? 'work' : phone.phone_type,
  }));

  return {
    normalizedEmails,
    normalizedPhones,
  };
}
