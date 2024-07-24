import { Address } from '@crm/@lib/@types';
import {
  UnifiedCrmContactInput,
  UnifiedCrmContactOutput,
} from '@crm/contact/types/model.unified';
import { IContactMapper } from '@crm/contact/types';
import { PipedriveContactInput, PipedriveContactOutput } from './types';
import { Utils } from '@crm/@lib/@utils';
import { MappersRegistry } from '@@core/@core-services/registries/mappers.registry';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PipedriveContactMapper implements IContactMapper {
  constructor(private mappersRegistry: MappersRegistry, private utils: Utils) {
    this.mappersRegistry.registerService('crm', 'contact', 'pipedrive', this);
  }

  async desunify(
    source: UnifiedCrmContactInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<PipedriveContactInput> {
    const primaryEmail = source.email_addresses?.[0]?.email_address;
    const primaryPhone = source.phone_numbers?.[0]?.phone_number;

    const emailObject = primaryEmail
      ? [{ value: primaryEmail, primary: true, label: null }]
      : [];
    const phoneObject = primaryPhone
      ? [
          {
            value: primaryPhone,
            primary: true,
            label:
              source.phone_numbers?.[0]?.phone_type == 'MOBILE'
                ? 'Mobile'
                : null,
          },
        ]
      : [];
    const result: PipedriveContactInput = {
      name: `${source.first_name} ${source.last_name}`,
      email: emailObject,
      phone: phoneObject,
    };

    if (source.user_id) {
      const owner = await this.utils.getUser(source.user_id);
      if (owner) {
        result.owner_id = {
          id: Number(owner.remote_id),
          name: owner.name,
          email: owner.email,
          has_pic: 0,
          pic_hash: null,
          active_flag: false,
          value: 0,
        };
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
    source: PipedriveContactOutput | PipedriveContactOutput[],
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
    contact: PipedriveContactOutput,
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedCrmContactOutput> {
    const field_mappings: { [key: string]: any } = {};
    if (customFieldMappings) {
      for (const mapping of customFieldMappings) {
        field_mappings[mapping.slug] = contact[mapping.remote_id];
      }
    }
    let opts: any = {};
    if (contact.owner_id.id) {
      const user_id = await this.utils.getUserUuidFromRemoteId(
        String(contact.owner_id.id),
        connectionId,
      );
      if (user_id) {
        opts = {
          user_id: user_id,
        };
      }
    }

    return {
      remote_id: String(contact.id),
      remote_data: contact,
      first_name: contact.first_name,
      last_name: contact.last_name,
      email_addresses: contact.email.map((e) => ({
        email_address: e.value,
        email_address_type: e.label ? e.label.toUpperCase() : null,
      })), // Map each email
      phone_numbers: contact.phone.map((p) => ({
        phone_number: p.value,
        phone_type: p.label ? p.label.toUpperCase() : null,
      })), // Map each phone number,
      field_mappings,
      ...opts,
    };
  }
}
