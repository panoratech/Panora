import {
  UnifiedCrmContactInput,
  UnifiedCrmContactOutput,
} from '@crm/contact/types/model.unified';
import { IContactMapper } from '@crm/contact/types';
import { AttioContactInput, AttioContactOutput } from './types';
import { Utils } from '@crm/@lib/@utils';
import { Injectable } from '@nestjs/common';
import { MappersRegistry } from '@@core/@core-services/registries/mappers.registry';
import { getCountryCode, getCountryName } from '@@core/utils/types';

@Injectable()
export class AttioContactMapper implements IContactMapper {
  constructor(private mappersRegistry: MappersRegistry, private utils: Utils) {
    this.mappersRegistry.registerService('crm', 'contact', 'attio', this);
  }

  async desunify(
    source: UnifiedCrmContactInput,
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

    if (source.addresses && source.addresses.length > 0) {
      const addy: any = {
        line_2: null,
        line_3: null,
        line_4: null,
        latitude: null,
        longitude: null,
      };
      addy.line_1 = source.addresses[0].street_1;
      if (source.addresses[0].city) {
        addy.locality = source.addresses[0].city;
      }
      if (source.addresses[0].state) {
        addy.region = source.addresses[0].state;
      }
      if (source.addresses[0].country) {
        addy.country_code = getCountryCode(source.addresses[0].country);
      }
      if (source.addresses[0].postal_code) {
        addy.postcode = source.addresses[0].postal_code;
      }
      result.values.primary_location = [addy];
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
    contact: AttioContactOutput,
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedCrmContactOutput> {
    const field_mappings: { [key: string]: any } = {};
    if (customFieldMappings) {
      for (const mapping of customFieldMappings) {
        field_mappings[mapping.slug] = contact.values[mapping.remote_id];
      }
    }

    const opts: any = {
      addresses: [],
    };

    const address: any = {};
    const addy_exists =
      contact.values.primary_location && contact.values.primary_location[0];

    if (addy_exists && addy_exists.line_1) {
      address.street_1 = addy_exists.line_1;
    }
    if (addy_exists && addy_exists.locality) {
      address.city = addy_exists.locality;
    }
    if (addy_exists && addy_exists.region) {
      address.state = addy_exists.region;
    }
    if (addy_exists && addy_exists.postcode) {
      address.postal_code = addy_exists.postcode;
    }
    if (addy_exists && addy_exists.country_code) {
      address.country = getCountryName(addy_exists.country_code);
    }
    address.address_type = 'PERSONAL';
    opts.addresses[0] = address;

    return {
      remote_id: contact.id.record_id,
      remote_data: contact,
      first_name: contact.values.name[0]?.first_name,
      last_name: contact.values.name[0]?.last_name,
      email_addresses: contact.values.email_addresses?.map((e) => ({
        email_address: e.email_address,
        email_address_type: 'PERSONAL',
      })),
      phone_numbers: contact.values.phone_numbers?.map((p) => ({
        phone_number: p.original_phone_number,
        phone_type: 'MOBILE',
      })),
      field_mappings,
      ...opts,
    };
  }
}
