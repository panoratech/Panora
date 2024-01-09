import {
  Address,
  ZendeskContactInput,
  ZendeskContactOutput,
} from '@crm/@utils/@types';
import {
  UnifiedContactInput,
  UnifiedContactOutput,
} from '@crm/contact/types/model.unified';
import { IContactMapper } from '@crm/contact/types';

export class ZendeskContactMapper implements IContactMapper {
  desunify(
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
      address: {
        line1: source.addresses[0].street_1,
        city: source.addresses[0].city,
        state: source.addresses[0].state,
        postal_code: source.addresses[0].postal_code,
        country: source.addresses[0].country,
      },
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

  unify(
    source: ZendeskContactOutput | ZendeskContactOutput[],
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): UnifiedContactOutput | UnifiedContactOutput[] {
    if (!Array.isArray(source)) {
      return this.mapSingleContactToUnified(source, customFieldMappings);
    }

    // Handling array of HubspotContactOutput
    return source.map((contact) =>
      this.mapSingleContactToUnified(contact, customFieldMappings),
    );
  }

  private mapSingleContactToUnified(
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
      phone_numbers.push({
        phone_number: contact.mobile,
        phone_type: 'mobile',
      });
    }

    const address: Address = {
      street_1: contact.address.line1,
      city: contact.address.city,
      state: contact.address.state,
      postal_code: contact.address.postal_code,
      country: contact.address.country,
    };

    return {
      first_name: contact.first_name,
      last_name: contact.last_name,
      email_addresses,
      phone_numbers,
      field_mappings,
      addresses: [address],
    };
  }
}
