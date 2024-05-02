import { Address } from '@crm/@lib/@types';
import {
  UnifiedContactInput,
  UnifiedContactOutput,
} from '@crm/contact/types/model.unified';
import { IContactMapper } from '@crm/contact/types';
import { ZohoContactInput, ZohoContactOutput } from './types';
import { Utils } from '@crm/@lib/@utils';

export class ZohoContactMapper implements IContactMapper {
  private utils = new Utils();

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
    };
    if (primaryEmail) {
      result.Email = primaryEmail;
    }
    if (primaryPhone) {
      result.Phone = primaryPhone;
    }
    if (source.addresses && source.addresses[0]) {
      result.Mailing_Street = source.addresses[0].street_1;
      result.Mailing_City = source.addresses[0].city;
      result.Mailing_State = source.addresses[0].state;
      result.Mailing_Zip = source.addresses[0].postal_code;
      result.Mailing_Country = source.addresses[0].country;
    }
    if (customFieldMappings && source.field_mappings) {
      for (const [k, v] of Object.entries(source.field_mappings)) {
        const mapping = customFieldMappings.find(
          (mapping) => mapping.slug === k,
        );
        if (mapping) {
          result[mapping.remote_id] = v;
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
    return Promise.all(
      source.map((contact) =>
        this.mapSingleContactToUnified(contact, customFieldMappings),
      ),
    );
  }

  private async mapSingleContactToUnified(
    contact: ZohoContactOutput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedContactOutput> {
    const field_mappings: { [key: string]: any } = {};
    if (customFieldMappings) {
      for (const mapping of customFieldMappings) {
        field_mappings[mapping.slug] = contact[mapping.remote_id];
      }
    }
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
      first_name: contact.First_Name ? contact.First_Name : '',
      last_name: contact.Last_Name ? contact.Last_Name : '',
      email_addresses,
      phone_numbers,
      field_mappings,
      user_id: await this.utils.getUserUuidFromRemoteId(
        contact.Owner.id,
        'zoho',
      ),
      addresses: [address],
    };
  }
}
