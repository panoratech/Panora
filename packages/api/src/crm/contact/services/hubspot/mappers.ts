import {
  UnifiedContactInput,
  UnifiedContactOutput,
} from '@crm/contact/types/model.unified';
import { IContactMapper } from '@crm/contact/types';
import { HubspotContactInput, HubspotContactOutput } from './types';
import { Utils } from '@crm/@lib/@utils';
import { MappersRegistry } from '@@core/@core-services/registries/mappers.registry';
import { Injectable } from '@nestjs/common';

@Injectable()
export class HubspotContactMapper implements IContactMapper {
  constructor(private mappersRegistry: MappersRegistry, private utils: Utils) {
    this.mappersRegistry.registerService('crm', 'contact', 'hubspot', this);
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
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedContactOutput | UnifiedContactOutput[]> {
    if (!Array.isArray(source)) {
      return this.mapSingleContactToUnified(
        source,
        connectionId,
        customFieldMappings,
      );
    }
    // Handling array of HubspotContactOutput
    return source.map((contact) =>
      this.mapSingleContactToUnified(
        contact,
        connectionId,
        customFieldMappings,
      ),
    );
  }

  private mapSingleContactToUnified(
    contact: HubspotContactOutput,
    connectionId: string,
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
      street_1: null,
      city: null,
      state: null,
      postal_code: null,
      country: null,
    };*/

    return {
      remote_id: contact.id,
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
