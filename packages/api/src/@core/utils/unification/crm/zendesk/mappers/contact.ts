import { ZendeskContactInput, ZendeskContactOutput } from 'src/crm/@types';
import {
  UnifiedContactInput,
  UnifiedContactOutput,
} from '@contact/types/model.unified';

export function mapToZendeskContact(
  source: UnifiedContactInput,
): ZendeskContactInput {
  // Assuming 'email_addresses' array contains at least one email and 'phone_numbers' array contains at least one phone number
  const primaryEmail = source.email_addresses?.[0]?.email_address;
  const primaryPhone = source.phone_numbers?.[0]?.phone_number;

  return {
    name: `${source.first_name} ${source.last_name}`,
    first_name: source.first_name,
    last_name: source.last_name,
    email: primaryEmail,
    phone: primaryPhone,
  };
}

export function mapToUnifiedContact(
  source: ZendeskContactOutput | ZendeskContactOutput[],
): UnifiedContactOutput | UnifiedContactOutput[] {
  if (!Array.isArray(source)) {
    return _mapSingleZendeskContact(source);
  }

  // Handling array of ZendeskContactOutput
  return source.map(_mapSingleZendeskContact);
}

function _mapSingleZendeskContact(
  contact: ZendeskContactOutput,
): UnifiedContactOutput {
  // Constructing the email and phone details
  const email_addresses = contact.email
    ? [{ email_address: contact.email, email_address_type: 'primary' }]
    : [];
  const phone_numbers = [];

  if (contact.phone) {
    phone_numbers.push({ phone_number: contact.phone, phone_type: 'work' });
  }
  if (contact.mobile) {
    phone_numbers.push({ phone_number: contact.mobile, phone_type: 'mobile' });
  }

  return {
    first_name: contact.first_name,
    last_name: contact.last_name,
    email_addresses,
    phone_numbers,
  };
}
