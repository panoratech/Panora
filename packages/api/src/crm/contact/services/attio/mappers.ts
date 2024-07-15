import { Address } from '@crm/@lib/@types';
import {
  UnifiedContactInput,
  UnifiedContactOutput,
} from '@crm/contact/types/model.unified';
import { IContactMapper } from '@crm/contact/types';
import { AttioContactInput, AttioContactOutput } from './types';
import { Utils } from '@crm/@lib/@utils';
import { Injectable } from '@nestjs/common';
import { MappersRegistry } from '@@core/@core-services/registries/mappers.registry';

@Injectable()
export class AttioContactMapper implements IContactMapper {
  constructor(private mappersRegistry: MappersRegistry, private utils: Utils) {
    this.mappersRegistry.registerService('crm', 'contact', 'attio', this);
  }

  async desunify(
    source: UnifiedContactInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<AttioContactInput> {
    // Assuming 'email_addresses' and 'phone_numbers' arrays contain at least one entry
    const primaryEmail = source.email_addresses?.[0]?.email_address;
    const primaryPhone = source.phone_numbers?.[0]?.phone_number;

    const result: AttioContactInput = {
      values: {
        name: [
          {
            first_name: source.first_name,
            last_name: source.last_name,
            full_name: `${source.first_name} ${source.last_name}`,
          },
        ],
      },
    };

    if (primaryEmail) {
      result.values.email_addresses = [{ email_address: primaryEmail }];
    }

    if (primaryPhone) {
      result.values.phone_numbers = [primaryPhone];
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
    source: AttioContactOutput | AttioContactOutput[],
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedContactOutput | UnifiedContactOutput[]> {
    if (!Array.isArray(source)) {
      return await this.mapSingleContactToUnified(
        source,
        connectionId,
        customFieldMappings,
      );
    }

    // Handling array of HubspotContactOutput
    return Promise.all(
      source.map((contact) =>
        this.mapSingleContactToUnified(
          contact,
          connectionId,
          customFieldMappings,
        ),
      ),
    );
  }

  private async mapSingleContactToUnified(
    contact: AttioContactOutput,
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedContactOutput> {
    const field_mappings: { [key: string]: any } = {};
    if (customFieldMappings) {
      for (const mapping of customFieldMappings) {
        field_mappings[mapping.slug] = contact.values[mapping.remote_id];
      }
    }
    const address: Address = {
      street_1: null,
      city: null,
      state: null,
      postal_code: null,
      country: null,
    };

    return {
      remote_id: contact.id.record_id,
      first_name: contact.values.name[0]?.first_name,
      last_name: contact.values.name[0]?.last_name,
      // user_id: contact.values.created_by[0]?.referenced_actor_id,
      email_addresses: contact.values.email_addresses?.map((e) => ({
        email_address: e.email_address,
        email_address_type: e.attribute_type ? e.attribute_type : null,
      })), // Map each email
      phone_numbers: contact.values.phone_numbers?.map((p) => ({
        phone_number: p.original_phone_number,
        phone_type: p.attribute_type ? p.attribute_type : null,
      })), // Map each phone number,
      field_mappings,
      addresses: [address],
    };
  }
}
