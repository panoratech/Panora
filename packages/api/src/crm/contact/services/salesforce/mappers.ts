import {
    UnifiedCrmContactInput,
    UnifiedCrmContactOutput,
  } from '@crm/contact/types/model.unified';
  import { IContactMapper } from '@crm/contact/types';
  import { SalesforceContactInput, SalesforceContactOutput } from './types';
  import { Utils } from '@crm/@lib/@utils';
  import { MappersRegistry } from '@@core/@core-services/registries/mappers.registry';
  import { Injectable } from '@nestjs/common';
  
  @Injectable()
  export class SalesforceContactMapper implements IContactMapper {
    constructor(private mappersRegistry: MappersRegistry, private utils: Utils) {
      this.mappersRegistry.registerService('crm', 'contact', 'salesforce', this);
    }
  
    async desunify(
      source: UnifiedCrmContactInput,
      customFieldMappings?: {
        slug: string;
        remote_id: string;
      }[],
    ): Promise<SalesforceContactInput> {
      const result: SalesforceContactInput = {
        FirstName: source.first_name,
        LastName: source.last_name,
      };
  
      if (source.email_addresses && source.email_addresses.length > 0) {
        result.Email = source.email_addresses[0].email_address;
      }
  
      if (source.phone_numbers && source.phone_numbers.length > 0) {
        result.Phone = source.phone_numbers[0].phone_number;
      }
  
      if (source.addresses && source.addresses.length > 0) {
        result.MailingStreet = source.addresses[0].street_1;
        result.MailingCity = source.addresses[0].city;
        result.MailingState = source.addresses[0].state;
        result.MailingCountry = source.addresses[0].country;
        result.MailingPostalCode = source.addresses[0].postal_code;
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
      source: SalesforceContactOutput | SalesforceContactOutput[],
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
      return source.map((contact) =>
        this.mapSingleContactToUnified(
          contact,
          connectionId,
          customFieldMappings,
        ),
      );
    }
  
    private mapSingleContactToUnified(
      contact: SalesforceContactOutput,
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
        remote_id: contact.Id,
        remote_data: contact,
        first_name: contact.FirstName,
        last_name: contact.LastName,
        email_addresses: [
          {
            email_address: contact.Email,
            email_address_type: 'PERSONAL',
            owner_type: 'contact',
          },
        ],
        phone_numbers: [
          {
            phone_number: contact.Phone,
            phone_type: 'PERSONAL',
            owner_type: 'contact',
          },
        ],
        addresses: [
          {
            street_1: contact.MailingStreet,
            city: contact.MailingCity,
            state: contact.MailingState,
            postal_code: contact.MailingPostalCode,
            country: contact.MailingCountry,
          },
        ],
        field_mappings,
      };
    }
  }