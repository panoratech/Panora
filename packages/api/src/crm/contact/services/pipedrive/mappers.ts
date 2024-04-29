import { Address } from '@crm/@utils/@types';
import {
  UnifiedContactInput,
  UnifiedContactOutput,
} from '@crm/contact/types/model.unified';
import { IContactMapper } from '@crm/contact/types';
import { Utils } from '@crm/contact/utils';
import { PipedriveContactInput, PipedriveContactOutput } from './types';

export class PipedriveContactMapper implements IContactMapper {
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
  ): Promise<PipedriveContactInput> {
    // Assuming 'email_addresses' and 'phone_numbers' arrays contain at least one entry
    const primaryEmail = source.email_addresses?.[0]?.email_address;
    const primaryPhone = source.phone_numbers?.[0]?.phone_number;

    const emailObject = primaryEmail
      ? [{ value: primaryEmail, primary: true, label: '' }]
      : [];
    const phoneObject = primaryPhone
      ? [{ value: primaryPhone, primary: true, label: '' }]
      : [];
    const result: PipedriveContactInput = {
      name: `${source.first_name} ${source.last_name}`,
      email: emailObject,
      phone: phoneObject,
      cc_email: source.user_id, //TODO: i put in here for tmp reasons uuid
    };

    if (source.user_id) {
      const owner = await this.utils.getUser(source.user_id);
      if (owner) {
        result.owner_id = {
          id: Number(owner.remote_id),
          name: owner.name,
          email: owner.email,
          has_pic: 0,
          pic_hash: '',
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
    contact: PipedriveContactOutput,
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
    const address: Address = {
      street_1: '',
      city: '',
      state: '',
      postal_code: '',
      country: '',
    };
    let opts: any = {};
    if (contact.owner_id.id) {
      const user_id = await this.utils.getUserUuidFromRemoteId(
        String(contact.owner_id.id),
        'pipedrive',
      );
      if (user_id) {
        opts = {
          user_id: user_id,
        };
      }
    }

    return {
      first_name: contact.first_name,
      last_name: contact.last_name,
      email_addresses: contact.email.map((e) => ({
        email_address: e.value,
        email_address_type: e.label ? e.label : '',
      })), // Map each email
      phone_numbers: contact.phone.map((p) => ({
        phone_number: p.value,
        phone_type: p.label ? p.label : '',
      })), // Map each phone number,
      field_mappings,
      addresses: [address],
      ...opts,
    };
  }
}
