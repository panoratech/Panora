import { Address } from '@crm/@lib/@types';
import {
  UnifiedCrmContactInput,
  UnifiedCrmContactOutput,
} from '@crm/contact/types/model.unified';
import { IContactMapper } from '@crm/contact/types';
import { ZohoContactInput, ZohoContactOutput } from './types';
import { Utils } from '@crm/@lib/@utils';
import { MappersRegistry } from '@@core/@core-services/registries/mappers.registry';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ZohoContactMapper implements IContactMapper {
  constructor(private mappersRegistry: MappersRegistry, private utils: Utils) {
    this.mappersRegistry.registerService('crm', 'contact', 'zoho', this);
  }
  desunify(
    source: UnifiedCrmContactInput,
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
    if (primaryPhone && source.phone_numbers?.[0]?.phone_type == 'WORK') {
      result.Phone = primaryPhone;
    }
    if (primaryPhone && source.phone_numbers?.[0]?.phone_type == 'MOBILE') {
      result.Mobile = primaryPhone;
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
    contact: ZohoContactOutput,
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
    // Constructing email and phone details
    const email_addresses =
      contact && contact.Email
        ? [{ email_address: contact.Email, email_address_type: 'PERSONAL' }]
        : [];

    const phone_numbers = [];

    if (contact && contact.Phone) {
      phone_numbers.push({
        phone_number: contact.Phone,
        phone_type: 'WORK',
      });
    }
    if (contact && contact.Mobile) {
      phone_numbers.push({
        phone_number: contact.Mobile,
        phone_type: 'MOBILE',
      });
    }
    if (contact && contact.Fax) {
      phone_numbers.push({
        phone_number: contact.Fax,
        phone_type: 'FAX',
      });
    }
    if (contact && contact.Home_Phone) {
      phone_numbers.push({
        phone_number: contact.Home_Phone,
        phone_type: 'HOME',
      });
    }

    const address: Address = {
      street_1: contact.Mailing_Street,
      city: contact.Mailing_City,
      state: contact.Mailing_State,
      postal_code: contact.Mailing_Zip,
      country: contact.Mailing_Country,
    };

    const opts: any = {};
    if (contact.Owner && contact.Owner.id) {
      opts.user_id = await this.utils.getUserUuidFromRemoteId(
        contact.Owner.id,
        connectionId,
      );
    }

    return {
      remote_id: String(contact.id),
      remote_data: contact,
      first_name: contact.First_Name ?? null,
      last_name: contact.Last_Name ?? null,
      email_addresses,
      phone_numbers,
      field_mappings,
      ...opts,
      addresses: [address],
    };
  }
}
