import {
  Address,
  ZohoContactInput,
  ZohoContactOutput,
} from '@crm/@utils/@types';
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
      Mailing_Street: source.addresses[0].street_1,
      Mailing_City: source.addresses[0].city,
      Mailing_State: source.addresses[0].state,
      Mailing_Zip: source.addresses[0].postal_code,
      Mailing_Country: source.addresses[0].country,
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

  async unify(
    source: ZohoContactOutput | ZohoContactOutput[],
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedContactOutput | UnifiedContactOutput[]> {
    if (!Array.isArray(source)) {
      return this.mapSingleContactToUnified(source, customFieldMappings);
    }

    // Handling array of HubspotContactOutput
    return source.map((contact) =>
      this.mapSingleContactToUnified(contact, customFieldMappings),
    );
  }

  private mapSingleContactToUnified(
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

    const address: Address = {
      street_1: contact.Mailing_Street,
      city: contact.Mailing_City,
      state: contact.Mailing_State,
      postal_code: contact.Mailing_Zip,
      country: contact.Mailing_Country,
    };

    return {
      remote_id: contact.id,
      first_name: contact.First_Name ? contact.First_Name : '',
      last_name: contact.Last_Name ? contact.Last_Name : '',
      email_addresses,
      phone_numbers,
      field_mappings,
      addresses: [address],
    };
  }
}
