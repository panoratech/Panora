import { HubspotContactInput, HubspotContactOutput } from 'src/crm/@types';
import {
  UnifiedContactInput,
  UnifiedContactOutput,
} from '@contact/types/model.unified';

export function mapToHubspotContact(
  source: UnifiedContactInput,
): HubspotContactInput {
  // Assuming 'email_addresses' array contains at least one email and 'phone_numbers' array contains at least one phone number
  const primaryEmail = source.email_addresses?.[0]?.email_address;
  const primaryPhone = source.phone_numbers?.[0]?.phone_number;

  return {
    firstname: source.first_name,
    lastname: source.last_name,
    email: primaryEmail,
    phone: primaryPhone,
  };
}

export function mapToUnifiedContact(
  source: HubspotContactOutput | HubspotContactOutput[],
): UnifiedContactOutput | UnifiedContactOutput[] {
  if (!Array.isArray(source)) {
    return _mapSingleContact(source);
  }

  // Handling array of HubspotContactOutput
  return source.map(_mapSingleContact);
}

function _mapSingleContact(
  contact: HubspotContactOutput,
): UnifiedContactOutput {
  return {
    first_name: contact.properties.firstname,
    last_name: contact.properties.lastname,
    email_addresses: [
      {
        email_address: contact.properties.email,
        email_address_type: 'primary',
      },
    ],
    phone_numbers: [
      { phone_number: '' /*contact.properties.*/, phone_type: 'primary' },
    ],
  };
}
