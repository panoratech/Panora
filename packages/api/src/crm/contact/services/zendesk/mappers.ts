import { ZendeskContactInput, ZendeskContactOutput } from 'src/crm/@types';
import {
  UnifiedContactInput,
  UnifiedContactOutput,
} from '@contact/types/model.unified';

export function mapToContact_Zendesk(
  source: UnifiedContactInput,
  customFieldMappings?: {
    slug: string;
    remote_id: string;
  }[],
): ZendeskContactInput {
  // Assuming 'email_addresses' array contains at least one email and 'phone_numbers' array contains at least one phone number
  const primaryEmail = source.email_addresses?.[0]?.email_address;
  const primaryPhone = source.phone_numbers?.[0]?.phone_number;

  const result: ZendeskContactInput = {
    name: `${source.first_name} ${source.last_name}`,
    first_name: source.first_name,
    last_name: source.last_name,
    email: primaryEmail,
    phone: primaryPhone,
  };

  if (customFieldMappings && source.field_mappings) {
    for (const fieldMapping of source.field_mappings) {
      for (const key in fieldMapping) {
        const mapping = customFieldMappings.find(
          (mapping) => mapping.slug === key,
        );
        if (mapping) {
          result.custom_fields[mapping.remote_id] = fieldMapping[key];
        }
      }
    }
  }

  return result;
}

export function mapToUnifiedContact_Zendesk(
  source: ZendeskContactOutput | ZendeskContactOutput[],
  customFieldMappings?: {
    slug: string;
    remote_id: string;
  }[],
): UnifiedContactOutput | UnifiedContactOutput[] {
  if (!Array.isArray(source)) {
    return _mapSingleZendeskContact(source, customFieldMappings);
  }

  // Handling array of HubspotContactOutput
  return source.map((contact) =>
    _mapSingleZendeskContact(contact, customFieldMappings),
  );
}

function _mapSingleZendeskContact(
  contact: ZendeskContactOutput,
  customFieldMappings?: {
    slug: string;
    remote_id: string;
  }[],
): UnifiedContactOutput {
  const field_mappings = customFieldMappings.map((mapping) => ({
    [mapping.slug]: contact.custom_fields[mapping.remote_id],
  }));
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
    field_mappings,
  };
}
