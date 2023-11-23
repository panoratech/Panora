import { ZohoContactInput, ZohoContactOutput } from 'src/crm/@types';
import {
  UnifiedContactInput,
  UnifiedContactOutput,
} from 'src/crm/contact/dto/create-contact.dto';

export function mapToZohoContact(
  source: UnifiedContactInput,
): ZohoContactInput {
  // Assuming 'email_addresses' array contains at least one email and 'phone_numbers' array contains at least one phone number
  const primaryEmail = source.email_addresses?.[0]?.email_address;
  const primaryPhone = source.phone_numbers?.[0]?.phone_number;

  //TODO zoho input weird ???
  return; /*{
    firstname: source_.first_name,
    lastname: source_.last_name,
    email: primaryEmail,
    phone: primaryPhone,
    // Map other fields as needed
    // If there are fields such as city, country, etc., in your UnifiedContactInput, map them here
  };*/
}
//TODO
export function mapToUnifiedContact(
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
  // Finding the primary contact person
  const primaryContact = contact.contact_persons.find(
    (p) => p.is_primary_contact,
  );

  // Constructing email and phone details
  const email_addresses =
    primaryContact && primaryContact.email
      ? [{ email_address: primaryContact.email, email_address_type: 'primary' }]
      : [];
  const phone_numbers = [];

  if (primaryContact && primaryContact.phone) {
    phone_numbers.push({
      phone_number: primaryContact.phone,
      phone_type: 'work',
    });
  }
  if (primaryContact && primaryContact.mobile) {
    phone_numbers.push({
      phone_number: primaryContact.mobile,
      phone_type: 'mobile',
    });
  }

  return {
    first_name: primaryContact ? primaryContact.first_name : '',
    last_name: primaryContact ? primaryContact.last_name : '',
    email_addresses,
    phone_numbers,
  };
}
