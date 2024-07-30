import { WealthboxCompanyInput, WealthboxCompanyOutput } from './types';
import {
  UnifiedCrmCompanyInput,
  UnifiedCrmCompanyOutput,
} from '@crm/company/types/model.unified';
import { ICompanyMapper } from '@crm/company/types';
import { Utils } from '@crm/@lib/@utils';
import { Injectable } from '@nestjs/common';
import { MappersRegistry } from '@@core/@core-services/registries/mappers.registry';
import { getCountryCode, getCountryName } from '@@core/utils/types';

@Injectable()
export class WealthboxCompanyMapper implements ICompanyMapper {
  constructor(private mappersRegistry: MappersRegistry, private utils: Utils) {
    this.mappersRegistry.registerService('crm', 'company', 'wealthbox', this);
  }

  async desunify(
    source: UnifiedCrmCompanyInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<WealthboxCompanyInput> {

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

    const result: WealthboxCompanyInput = {
      first_name: source.name.split(" ")[0],
      last_name: source.name.split(" ")[1],
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
    source: WealthboxCompanyOutput | WealthboxCompanyOutput[],
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedCrmCompanyOutput | UnifiedCrmCompanyOutput[]> {
    if (!Array.isArray(source)) {
      return this.mapSingleCompanyToUnified(
        source,
        connectionId,
        customFieldMappings,
      );
    }
    // Handling array of WealthboxCompanyOutput
    return Promise.all(
      source.map((company) =>
        this.mapSingleCompanyToUnified(
          company,
          connectionId,
          customFieldMappings,
        ),
      ),
    );
  }

  private async mapSingleCompanyToUnified(
    company: WealthboxCompanyOutput,
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedCrmCompanyOutput> {
    const field_mappings: { [key: string]: any } = {};
    if (customFieldMappings) {
      for (const mapping of customFieldMappings) {
        field_mappings[mapping.slug] = company[mapping.remote_id];
      }
    }
    const opts: any = {
      addresses: [],
    };

    const address: any = {};
    const addy_exists =
    company.street_addresses && company.street_addresses[0];

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
      remote_id: company.id,
      remote_data: company,
      first_name: company.first_name,
      last_name: company.last_name,
      email_addresses: company.email_addresses.map((e) => ({
        email_id: e.id,
        email_address: e.address,
        email_principal: e.principal,
        email_kind: e.kind,
      })),
      phone_numbers: company.phone_numbers?.map((phone) => ({
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
