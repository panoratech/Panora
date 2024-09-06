import { Address } from '@crm/@lib/@types';
import {
  UnifiedCrmContactInput,
  UnifiedCrmContactOutput,
} from '@crm/contact/types/model.unified';
import { IContactMapper } from '@crm/contact/types';
import { ZendeskContactInput, ZendeskContactOutput } from './types';
import { Utils } from '@crm/@lib/@utils';
import { MappersRegistry } from '@@core/@core-services/registries/mappers.registry';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ZendeskContactMapper implements IContactMapper {
  constructor(private mappersRegistry: MappersRegistry, private utils: Utils) {
    this.mappersRegistry.registerService('crm', 'contact', 'zendesk', this);
  }

  async desunify(
    source: UnifiedCrmContactInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<ZendeskContactInput> {
    // Assuming 'email_addresses' array contains at least one email and 'phone_numbers' array contains at least one phone number
    const primaryEmail = source.email_addresses?.[0]?.email_address;
    const primaryPhone = source.phone_numbers?.[0]?.phone_number;

    const result: ZendeskContactInput = {
      name: `${source.first_name} ${source.last_name}`,
      first_name: source.first_name,
      last_name: source.last_name,
    };

    if (primaryEmail) {
      result.email = primaryEmail;
    }
    if (primaryPhone) {
      result.phone = primaryPhone;
    }
    if (source.addresses && source.addresses[0]) {
      result.address = {
        line1: source.addresses[0].street_1,
        city: source.addresses[0].city,
        state: source.addresses[0].state,
        postal_code: source.addresses[0].postal_code,
        country: source.addresses[0].country,
      };
    }

    if (source.user_id) {
      const owner_id = await this.utils.getRemoteIdFromUserUuid(source.user_id);
      if (owner_id) {
        result.owner_id = Number(owner_id);
      }
    }

    if (customFieldMappings && source.field_mappings) {
      for (const [k, v] of Object.entries(source.field_mappings)) {
        const mapping = customFieldMappings.find(
          (mapping) => mapping.slug === k,
        );
        if (mapping) {
          result.custom_fields[mapping.remote_id] = v;
        }
      }
    }

    return result;
  }

  async unify(
    source: ZendeskContactOutput | ZendeskContactOutput[],
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedCrmContactOutput | UnifiedCrmContactOutput[]> {
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
    contact: ZendeskContactOutput,
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedCrmContactOutput> {
    const field_mappings: { [key: string]: any } = {};
    if (customFieldMappings) {
      for (const mapping of customFieldMappings) {
        field_mappings[mapping.slug] = contact.custom_fields[mapping.remote_id];
      }
    }
    // Constructing the email and phone details
    const email_addresses = contact.email
      ? [{ email_address: contact.email, email_address_type: 'PERSONAL' }]
      : [];
    const phone_numbers = [];

    if (contact.phone) {
      phone_numbers.push({ phone_number: contact.phone, phone_type: 'WORK' });
    }
    if (contact.mobile) {
      phone_numbers.push({
        phone_number: contact.mobile,
        phone_type: 'MOBILE',
      });
    }

    let opts: any = {};
    if (contact.owner_id) {
      const user_id = await this.utils.getUserUuidFromRemoteId(
        String(contact.owner_id),
        connectionId,
      );
      if (user_id) {
        opts = {
          user_id: user_id,
        };
      }
    }

    const address: Address = {
      street_1: contact.address.line1,
      city: contact.address.city,
      state: contact.address.state,
      postal_code: contact.address.postal_code,
      country: contact.address.country,
    };

    return {
      remote_id: String(contact.id),
      remote_data: contact,
      first_name: contact.first_name,
      last_name: contact.last_name,
      email_addresses,
      phone_numbers,
      field_mappings,
      addresses: [address],
      ...opts,
    };
  }
}
