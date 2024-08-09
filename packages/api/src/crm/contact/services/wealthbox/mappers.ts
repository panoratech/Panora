import {
  UnifiedCrmContactInput,
  UnifiedCrmContactOutput,
} from '@crm/contact/types/model.unified';
import { IContactMapper } from '@crm/contact/types';
import { WealthboxContactInput, WealthboxContactOutput } from './types';
import { Utils } from '@crm/@lib/@utils';
import { MappersRegistry } from '@@core/@core-services/registries/mappers.registry';
import { Injectable } from '@nestjs/common';
import { getCountryCode } from '@@core/utils/types';
  
@Injectable()
export class wealthboxContactMapper implements IContactMapper {
  constructor(private mappersRegistry: MappersRegistry, private utils: Utils) {
    this.mappersRegistry.registerService('crm', 'contact', 'wealthbox', this);
  }

  async desunify(
    source: UnifiedCrmContactInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<WealthboxContactInput> {
    const primaryEmail = source.email_addresses?.[0]?.email_address;
    const primaryPhone = source.phone_numbers?.[0]?.phone_number;

    const email = primaryEmail
    ? [{ address: primaryEmail, principal: false, kind: null, destroy:false}]
    : [];
    const phone_numbers = primaryPhone
      ? [
          {
            address: primaryPhone,
            principal: false,
            extension : null,
            kind: null,
            destroy:false
          },
        ]
      : [];

    const result: WealthboxContactInput  = {
      first_name: source.first_name,
      last_name: source.last_name,
      email_addresses: email,
      phone_numbers: phone_numbers,
      type: null,
    };

   

    if (source.addresses && source.addresses.length > 0) {
      const location : any ={
        street_line_1: null,
        street_line_2: null,
        city: null,
        state: null,
        zip_code: 0,
        country: null,
        principal: false,
        kind: null,
        destroy: false
      }

      if(source.addresses[0].street_1)
        location.street_line_1 = source.addresses[0].street_1;
      if(source.addresses[0].street_2)
        location.street_line_2 = source.addresses[0].street_2;
      if (source.addresses[0].city) {
        location.city = source.addresses[0].city;
      }
      if (source.addresses[0].state) {
        location.state = source.addresses[0].state;
      }
      if (source.addresses[0].country) {
        location.country = source.addresses[0].country;
      }
      if (source.addresses[0].postal_code) {
        location.zip = source.addresses[0].postal_code;
      }
      if (source.addresses[0].country) {
          location.country_code = getCountryCode(source.addresses[0].country);
      }
      
      result.street_addresses = [location];
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
    source: WealthboxContactOutput | WealthboxContactOutput[],
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
    contact: WealthboxContactOutput,
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

    const opts: any = {
      addresses: [],
    };

    const address: any = {};
    const addy_exists =
      contact.street_addresses && contact.street_addresses[0];

    if (addy_exists && addy_exists.street_line_1) {
      address.street_1 = addy_exists.street_line_1;
    }
    if (addy_exists && addy_exists.city) {
      address.city = addy_exists.city;
    }
    if (addy_exists && addy_exists.state) {
      address.state = addy_exists.state;
    }
    if (addy_exists && addy_exists.zip_code) {
      address.zip_code = addy_exists.zip_code;
    }
    if (addy_exists && addy_exists.country) {
      address.country = addy_exists.country;
    }
   
    opts.addresses[0] = address;

    return {
      remote_id: contact.id,
      remote_data: contact,
      first_name: contact.first_name,
      last_name: contact.last_name,
      email_addresses: contact.email_addresses.map((e) => ({
        email_id: e.id,
        email_address: e.address,
        email_principal: e.principal,
        email_kind: e.kind,
      })),
      phone_numbers: contact.phone_numbers?.map((phone) => ({
        phone_id: phone.id,
        phone_address: phone.address,
        phone_principal: phone.principal,
        phone_kind: phone.kind,
        phone_extension:phone.extension
      })),
      ...opts,
      field_mappings,
    };
  }
}