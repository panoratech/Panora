import {
  UnifiedContactInput,
  UnifiedContactOutput,
} from '@crm/contact/types/model.unified';
import { IContactMapper } from '@crm/contact/types';
import { Utils } from '@crm/contact/utils';
import { HubspotContactInput, HubspotContactOutput } from './types';

export class HubspotContactMapper implements IContactMapper {
  private readonly utils: Utils;

  constructor() {
    this.utils = new Utils();
  }

  async desunify(
    source: UnifiedContactInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<HubspotContactInput> {
    // Assuming 'email_addresses' array contains at least one email and 'phone_numbers' array contains at least one phone number
    const primaryEmail = source.email_addresses?.[0]?.email_address;
    const primaryPhone = source.phone_numbers?.[0]?.phone_number;

    const result: HubspotContactInput = {
      firstname: source.first_name,
      lastname: source.last_name,
    };

    if (primaryEmail) {
      result.email = primaryEmail;
    }
    if (primaryPhone) {
      result.phone = primaryPhone;
    }

    if (source.user_id) {
      const owner_id = await this.utils.getRemoteIdFromUserUuid(source.user_id);
      if (owner_id) {
        result.hubspot_owner_id = owner_id;
      }
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
    source: HubspotContactOutput | HubspotContactOutput[],
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
    contact: HubspotContactOutput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): UnifiedContactOutput {
    const field_mappings: { [key: string]: any } = {};
    if (customFieldMappings) {
      for (const mapping of customFieldMappings) {
        field_mappings[mapping.slug] = contact.properties[mapping.remote_id];
      }
    }

    /*todo: const address: Address = {
      street_1: '',
      city: '',
      state: '',
      postal_code: '',
      country: '',
    };*/

    return {
      first_name: contact.properties.firstname,
      last_name: contact.properties.lastname,
      email_addresses: [
        {
          email_address: contact.properties.email,
          email_address_type: 'primary',
          owner_type: 'contact',
        },
      ],
      phone_numbers: [
        {
          phone_number: contact.properties.phone,
          phone_type: 'primary',
          owner_type: 'contact',
        },
      ],
      field_mappings,
      addresses: [],
    };
  }
}
