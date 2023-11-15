import { HubspotContactInput } from 'src/crm/@types';
import { UnifiedContactInput } from 'src/crm/contact/dto/create-contact.dto';
import { Unified } from '../../../types';

export function mapToHubspotContact<T extends Unified>(
  source: T,
): HubspotContactInput {
  const source_ = source as UnifiedContactInput;
  // Assuming 'email_addresses' array contains at least one email and 'phone_numbers' array contains at least one phone number
  const primaryEmail = source_.email_addresses?.[0]?.email_address;
  const primaryPhone = source_.phone_numbers?.[0]?.phone_number;

  return {
    firstname: source_.first_name,
    lastname: source_.last_name,
    email: primaryEmail,
    phone: primaryPhone,
    // Map other fields as needed
    // If there are fields such as city, country, etc., in your UnifiedContactInput, map them here
  };
}
