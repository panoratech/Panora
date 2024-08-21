import { Address } from '@crm/@lib/@types';
import {
  UnifiedCrmContactInput,
  UnifiedCrmContactOutput,
} from '@crm/contact/types/model.unified';
import { IContactMapper } from '@crm/contact/types';
import { LeadSquaredContactInput, LeadSquaredContactOutput } from './types';
import { Utils } from '@crm/@lib/@utils';
import { MappersRegistry } from '@@core/@core-services/registries/mappers.registry';
import { Injectable } from '@nestjs/common';

@Injectable()
export class LeadSquaredContactMapper implements IContactMapper {
  constructor(
    private mappersRegistry: MappersRegistry,
    private utils: Utils,
  ) {
    this.mappersRegistry.registerService('crm', 'contact', 'leadsquared', this);
  }
  desunify(
    source: UnifiedCrmContactInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): LeadSquaredContactInput {
    // Assuming 'email_addresses' array contains at least one email and 'phone_numbers' array contains at least one phone number
    const primaryEmail = source.email_addresses?.[0]?.email_address;
    const primaryPhone = source.phone_numbers?.[0]?.phone_number;

    const result: LeadSquaredContactInput = {
      First_Name: source.first_name,
      Last_Name: source.last_name,
    };
    if (primaryEmail) {
      result.EmailAddress = primaryEmail;
    }
    if (primaryPhone && source.phone_numbers?.[0]?.phone_type == 'WORK') {
      result.Account_Phone = primaryPhone;
    }
    if (primaryPhone && source.phone_numbers?.[0]?.phone_type == 'MOBILE') {
      result.Mobile = primaryPhone;
    }
    if (source.addresses && source.addresses[0]) {
      result.Account_Street1 = source.addresses[0].street_1;
      result.Account_City = source.addresses[0].city;
      result.Account_State = source.addresses[0].state;
      result.Account_Zip = source.addresses[0].postal_code;
      result.Account_Country = source.addresses[0].country;
    }
    if (source.user_id) {
      result.OwnerId = source.user_id;
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
    source: LeadSquaredContactOutput | LeadSquaredContactOutput[],
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
    contact: LeadSquaredContactOutput,
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
      contact && contact.EmailAddress
        ? [
            {
              email_address: contact.EmailAddress,
              email_address_type: 'PERSONAL',
            },
          ]
        : [];

    const phone_numbers = [];

    if (contact && contact.Account_Phone) {
      phone_numbers.push({
        phone_number: contact.Account_Phone,
        phone_type: 'WORK',
      });
    }
    if (contact && contact.Mobile) {
      phone_numbers.push({
        phone_number: contact.Mobile,
        phone_type: 'MOBILE',
      });
    }
    if (contact && contact.Account_Fax) {
      phone_numbers.push({
        phone_number: contact.Account_Fax,
        phone_type: 'fax',
      });
    }
    if (contact && contact.Phone) {
      phone_numbers.push({
        phone_number: contact.Phone,
        phone_type: 'home',
      });
    }

    const address: Address = {
      street_1: contact.Account_Street1,
      city: contact.Account_City,
      state: contact.Account_State,
      postal_code: contact.Account_Zip,
      country: contact.Account_Country,
    };

    const opts: any = {};
    if (contact.OwnerId) {
      opts.user_id = await this.utils.getUserUuidFromRemoteId(
        contact.OwnerId,
        connectionId,
      );
    }

    return {
      remote_id: String(contact.pros),
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
