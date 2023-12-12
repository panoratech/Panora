import { ZohoContactInput, ZohoContactOutput } from 'src/crm/@types';
import {
  UnifiedContactInput,
  UnifiedContactOutput,
} from '@contact/types/model.unified';

export function mapToContact_Zoho(
  source: UnifiedContactInput,
): ZohoContactInput {
  // Assuming 'email_addresses' array contains at least one email and 'phone_numbers' array contains at least one phone number
  const primaryEmail = source.email_addresses?.[0]?.email_address;
  const primaryPhone = source.phone_numbers?.[0]?.phone_number;

  return {
    First_Name: source.first_name,
    Last_Name: source.last_name,
    Email: primaryEmail,
    Phone: primaryPhone,
  };
}

export function mapToUnifiedContact_Zoho(
  source: ZohoContactOutput | ZohoContactOutput[],
): UnifiedContactOutput | UnifiedContactOutput[] {
  if (!Array.isArray(source)) {
    return _mapSingleZohoContact(source);
  }

  // Handling array of ZohoContactOutput
  return source.map(_mapSingleZohoContact);
}

function _mapSingleZohoContact(
  contact: ZohoContactOutput,
): UnifiedContactOutput {
  // Constructing email and phone details
  const email_addresses =
    contact && contact.Email
      ? [{ email_address: contact.Email, email_address_type: 'primary' }]
      : [];

  const phone_numbers = [];

  if (contact && contact.Phone) {
    phone_numbers.push({
      phone_number: contact.Phone,
      phone_type: 'work',
    });
  }
  if (contact && contact.Mobile) {
    phone_numbers.push({
      phone_number: contact.Mobile,
      phone_type: 'mobile',
    });
  }
  if (contact && contact.Fax) {
    phone_numbers.push({
      phone_number: contact.Fax,
      phone_type: 'fax',
    });
  }
  if (contact && contact.Home_Phone) {
    phone_numbers.push({
      phone_number: contact.Home_Phone,
      phone_type: 'home',
    });
  }

  return {
    first_name: contact.First_Name ? contact.First_Name : '',
    last_name: contact.Last_Name ? contact.Last_Name : '',
    email_addresses,
    phone_numbers,
  };
}
