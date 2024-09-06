import {
  UnifiedCrmContactInput,
  UnifiedCrmContactOutput,
} from '@crm/contact/types/model.unified';
import { IContactMapper } from '@crm/contact/types';
import {
  CloseContactInput,
  CloseContactOutput,
  InputPhone,
  InputEmail,
} from './types';
import { Utils } from '@crm/@lib/@utils';
import { MappersRegistry } from '@@core/@core-services/registries/mappers.registry';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CloseContactMapper implements IContactMapper {
  constructor(private mappersRegistry: MappersRegistry, private utils: Utils) {
    this.mappersRegistry.registerService('crm', 'contact', 'close', this);
  }

  async desunify(
    source: UnifiedCrmContactInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<CloseContactInput> {
    /*const result: CloseContactInput = {
      name: `${source.first_name ?? null} ${source.last_name ?? null}`,
      phones: source?.phone_numbers?.map(
        ({ phone_number, phone_type }) =>
          ({
            phone: phone_number,
            type: phone_type,
          } as InputPhone),
      ),
      emails: source?.email_addresses?.map(
        ({ email_address, email_address_type }) =>
          ({
            email: email_address,
            type: email_address_type,
          } as InputEmail),
      ),
    };

    result.lead_id = source?.field_mappings?.['company_id'];

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
    */
    return;
  }

  async unify(
    source: CloseContactOutput | CloseContactOutput[],
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
    // Handling array of CloseContactOutput
    return source.map((contact) =>
      this.mapSingleContactToUnified(
        contact,
        connectionId,
        customFieldMappings,
      ),
    );
  }

  private mapSingleContactToUnified(
    contact: CloseContactOutput,
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): UnifiedCrmContactOutput {
    const field_mappings: { [key: string]: any } = {};
    if (customFieldMappings) {
      for (const mapping of customFieldMappings) {
        field_mappings[mapping.slug] = contact[mapping.remote_id];
      }
    }

    return {
      remote_id: contact.id,
      remote_data: contact,
      first_name: contact.name,
      last_name: null,
      email_addresses: contact.emails?.map(({ email, type }) => ({
        email_address: email,
        email_address_type: type,
        owner_type: 'contact',
      })),
      phone_numbers: contact.phones?.map(({ phone, type }) => ({
        phone_number: phone,
        phone_type: type,
        owner_type: 'contact',
      })),
      field_mappings,
      addresses: [],
    };
  }
}
