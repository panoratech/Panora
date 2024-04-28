import { Address } from '@crm/@utils/@types';
import {
  UnifiedContactInput,
  UnifiedContactOutput,
} from '@crm/contact/types/model.unified';
import { IContactMapper } from '@crm/contact/types';
import { Utils } from '@crm/contact/utils';
import { AttioContactInput, AttioContactOutput } from './types';

export class AttioContactMapper implements IContactMapper {
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
      result.values.phone_numbers = [{ original_phone_number: primaryPhone }];
    }

    // if (source.user_id) {
    //   const owner = await this.utils.getUser(source.user_id);
    //   if (owner) {
    //     result.id = {
    //       object_id: Number(owner.remote_id),
    //       name: owner.name,
    //       email: owner.email,
    //       has_pic: 0,
    //       pic_hash: '',
    //       active_flag: false,
    //       value: 0,
    //     };
    //   }
    // }

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
    source: AttioContactOutput | AttioContactOutput[],
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedContactOutput | UnifiedContactOutput[]> {
    if (!Array.isArray(source)) {
      return await this.mapSingleContactToUnified(source, customFieldMappings);
    }

    // Handling array of HubspotContactOutput
    return Promise.all(
      source.map((contact) =>
        this.mapSingleContactToUnified(contact, customFieldMappings),
      ),
    );
  }

  private async mapSingleContactToUnified(
    contact: AttioContactOutput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedContactOutput> {
    const field_mappings = customFieldMappings.map((mapping) => ({
      [mapping.slug]: contact.values[mapping.remote_id],
    }));
    const address: Address = {
      street_1: '',
      city: '',
      state: '',
      postal_code: '',
      country: '',
    };
    const opts: any = {};

    return {
      first_name: contact.values.name[0]?.first_name,
      last_name: contact.values.name[0]?.last_name,
      // user_id: contact.values.created_by[0]?.referenced_actor_id,
      email_addresses: contact.values.email_addresses?.map((e) => ({
        email_address: e.email_address,
        email_address_type: e.attribute_type ? e.attribute_type : '',
      })), // Map each email
      phone_numbers: contact.values.phone_numbers?.map((p) => ({
        phone_number: p.original_phone_number,
        phone_type: p.attribute_type ? p.attribute_type : '',
      })), // Map each phone number,
      field_mappings,
      addresses: [address],
      ...opts,
    };
  }
}
