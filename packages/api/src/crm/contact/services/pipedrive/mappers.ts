import { PipedriveContactInput, PipedriveContactOutput } from 'src/crm/@types';
import {
  UnifiedContactInput,
  UnifiedContactOutput,
} from '@contact/types/model.unified';

export function mapToContact_Pipedrive(
  source: UnifiedContactInput,
): PipedriveContactInput {
  // Assuming 'email_addresses' and 'phone_numbers' arrays contain at least one entry
  const primaryEmail = source.email_addresses?.[0]?.email_address;
  const primaryPhone = source.phone_numbers?.[0]?.phone_number;

  // Convert to Pipedrive format if needed
  const emailObject = primaryEmail
    ? [{ value: primaryEmail, primary: true, label: '' }]
    : [];
  const phoneObject = primaryPhone
    ? [{ value: primaryPhone, primary: true, label: '' }]
    : [];

  return {
    name: `${source.first_name} ${source.last_name}`,
    email: emailObject,
    phone: phoneObject,
  };
}

export function mapToUnifiedContact_Pipedrive(
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
      email_address_type: e.label ? e.label : '',
    })), // Map each email
    phone_numbers: contact.phone.map((p) => ({
      phone_number: p.value,
      phone_type: p.label ? p.label : '',
    })), // Map each phone number
  };
}
