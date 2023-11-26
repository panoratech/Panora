import { PipedriveContactInput, PipedriveContactOutput } from 'src/crm/@types';
import {
  UnifiedContactInput,
  UnifiedContactOutput,
} from 'src/crm/contact/types/model.unified';

export function mapToPipedriveContact(
  source: UnifiedContactInput,
): PipedriveContactInput {
  // Assuming 'email_addresses' and 'phone_numbers' arrays contain at least one entry
  const primaryEmail = source.email_addresses?.[0]?.email_address;
  const primaryPhone = source.phone_numbers?.[0]?.phone_number;

  // Convert to Pipedrive format if needed
  const emailObject = primaryEmail
    ? [{ value: primaryEmail, primary: true }]
    : [];
  const phoneObject = primaryPhone
    ? [{ value: primaryPhone, primary: true }]
    : [];

  return {
    name: `${source.first_name} ${source.last_name}`,
    email: emailObject,
    phone: phoneObject,
    // Map other optional fields as needed
    // label, visible_to, marketing_status, add_time, etc.
  };
}

export function mapToUnifiedContact(
  source: PipedriveContactOutput | PipedriveContactOutput[],
): UnifiedContactOutput | UnifiedContactOutput[] {
  if (!Array.isArray(source)) {
    return _mapSinglePipedriveContact(source);
  }

  // Handling array of PipedriveContactOutput
  return source.map(_mapSinglePipedriveContact);
}

function _mapSinglePipedriveContact(
  contact: PipedriveContactOutput,
): UnifiedContactOutput {
  return {
    first_name: contact.first_name,
    last_name: contact.last_name,
    email_addresses: contact.email.map((e) => ({
      email_address: e.value,
      email_address_type: e.label,
    })), // Map each email
    phone_numbers: contact.phone.map((p) => ({
      phone_number: p.value,
      phone_type: p.label,
    })), // Map each phone number
  };
}
