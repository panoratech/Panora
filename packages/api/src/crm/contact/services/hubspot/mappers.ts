import {
  UnifiedCrmContactInput,
  UnifiedCrmContactOutput,
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
    source: UnifiedCrmContactInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<HubspotContactInput> {
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

    if (source.addresses && source.addresses.length > 0) {
      result.address = source.addresses[0].street_1;
      if (source.addresses[0].city) {
        result.city = source.addresses[0].city;
      }
      if (source.addresses[0].state) {
        result.state = source.addresses[0].state;
      }
      if (source.addresses[0].country) {
        result.country = source.addresses[0].country;
      }
      if (source.addresses[0].postal_code) {
        result.zip = source.addresses[0].postal_code;
      }
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
  ): Promise<UnifiedCrmContactOutput | UnifiedCrmContactOutput[]> {
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
  ): UnifiedCrmContactOutput {
    const field_mappings: { [key: string]: any } = {};
    if (customFieldMappings) {
      for (const mapping of customFieldMappings) {
        field_mappings[mapping.slug] = contact.properties[mapping.remote_id];
      }
    }

    const opts: any = {
      addresses: [],
    };

    const address: any = {};
    if (contact.properties.address) {
      address.street_1 = contact.properties.address;
    }
    if (contact.properties.city) {
      address.city = contact.properties.city;
    }
    if (contact.properties.state) {
      address.state = contact.properties.state;
    }
    if (contact.properties.zip) {
      address.postal_code = contact.properties.zip;
    }
    if (contact.properties.country) {
      address.country = contact.properties.country;
    }
    opts.addresses[0] = address;

    return {
      remote_id: contact.id,
      remote_data: contact,
      first_name: contact.properties.firstname,
      last_name: contact.properties.lastname,
      email_addresses: [
        {
          email_address: contact.properties.email,
          email_address_type: 'PERSONAL',
          owner_type: 'contact',
        },
      ],
      phone_numbers: [
        {
          phone_number: contact.properties.phone,
          phone_type: 'PERSONAL',
          owner_type: 'contact',
        },
      ],
      ...opts,
      field_mappings,
    };
  }
}
