import { ZohoContactInput, ZohoContactOutput } from 'src/crm/@types';
import {
  UnifiedContactInput,
  UnifiedContactOutput,
} from '@crm/contact/types/model.unified';
import { IContactMapper } from '@crm/contact/types';

export class ZohoContactMapper implements IContactMapper {
  desunify(
    source: UnifiedContactInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): ZohoContactInput {
    // Assuming 'email_addresses' array contains at least one email and 'phone_numbers' array contains at least one phone number
    const primaryEmail = source.email_addresses?.[0]?.email_address;
    const primaryPhone = source.phone_numbers?.[0]?.phone_number;

    const result: ZohoContactInput = {
      First_Name: source.first_name,
      Last_Name: source.last_name,
      Email: primaryEmail,
      Phone: primaryPhone,
    };

    if (customFieldMappings && source.field_mappings) {
      for (const fieldMapping of source.field_mappings) {
        for (const key in fieldMapping) {
          const mapping = customFieldMappings.find(
            (mapping) => mapping.slug === key,
          );
          if (mapping) {
            result[mapping.remote_id] = fieldMapping[key];
          }
        }
      }
    }

    return result;
  }

  unify(
    source: ZohoContactOutput | ZohoContactOutput[],
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): UnifiedContactOutput | UnifiedContactOutput[] {
    if (!Array.isArray(source)) {
      return this.mapSingleZohoContactToUnified(source, customFieldMappings);
    }

    // Handling array of HubspotContactOutput
    return source.map((contact) =>
      this.mapSingleZohoContactToUnified(contact, customFieldMappings),
    );
  }

  mapSingleZohoContactToUnified(
    contact: ZohoContactOutput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): UnifiedContactOutput {
    const field_mappings = customFieldMappings.map((mapping) => ({
      [mapping.slug]: contact[mapping.remote_id],
    }));
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
      field_mappings,
    };
  }
}
