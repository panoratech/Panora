import { IContactMapper } from '@ticketing/contact/types';
import { ZendeskContactInput, ZendeskContactOutput } from './types';
import {
  UnifiedContactInput,
  UnifiedContactOutput,
} from '@ticketing/contact/types/model.unified';
import { MappersRegistry } from '@@core/@core-services/registries/mappers.registry';
import { Injectable } from '@nestjs/common';
import { Utils } from '@ticketing/@lib/@utils';

@Injectable()
export class ZendeskContactMapper implements IContactMapper {
  constructor(private mappersRegistry: MappersRegistry, private utils: Utils) {
    this.mappersRegistry.registerService(
      'ticketing',
      'contact',
      'zendesk',
      this,
    );
  }
  desunify(
    source: UnifiedContactInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): ZendeskContactInput {
    return;
  }

  unify(
    source: ZendeskContactOutput | ZendeskContactOutput[],
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): UnifiedContactOutput | UnifiedContactOutput[] {
    if (!Array.isArray(source)) {
      return this.mapSingleContactToUnified(
        source,
        connectionId,
        customFieldMappings,
      );
    }
    return source.map((ticket) =>
      this.mapSingleContactToUnified(ticket, connectionId, customFieldMappings),
    );
  }

  private mapSingleContactToUnified(
    contact: ZendeskContactOutput,
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): UnifiedContactOutput {
    const field_mappings: { [key: string]: any } = {};
    if (customFieldMappings) {
      for (const mapping of customFieldMappings) {
        field_mappings[mapping.slug] = contact.user_fields[mapping.remote_id];
      }
    }

    const unifiedContact: UnifiedContactOutput = {
      remote_id: String(contact.id),
      remote_data: contact,
      name: contact.name,
      email_address: contact.email,
      phone_number: contact.phone,
      details: contact.details,
      field_mappings: field_mappings,
    };

    return unifiedContact;
  }
}
