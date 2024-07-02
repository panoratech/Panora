import { IContactMapper } from '@ticketing/contact/types';
import { Injectable } from '@nestjs/common';
import { MappersRegistry } from '@@core/utils/registry/mappings.registry';
import { WrikeContactInput, WrikeContactOutput } from './types';
import { Utils } from '@ticketing/@lib/@utils';
import { UnifiedContactInput, UnifiedContactOutput } from '@ticketing/contact/types/model.unified';


@Injectable()
export class WrikeContactMapper implements IContactMapper {
  constructor(private mappersRegistry: MappersRegistry, private utils: Utils) {
    this.mappersRegistry.registerService('ticketing', 'contact', 'wrike', this);
  }
  desunify(
    source: UnifiedContactInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): WrikeContactInput {
    return;
  }

  unify(
    source: WrikeContactOutput | WrikeContactOutput[],
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): UnifiedContactOutput | UnifiedContactOutput[] {
    const sourcesArray = Array.isArray(source) ? source : [source];

    return sourcesArray.map((contact) =>
      this.mapSingleContactToUnified(contact, customFieldMappings),
    );
  }

  private mapSingleContactToUnified(
    contact: WrikeContactOutput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): UnifiedContactOutput {
    const field_mappings: { [key: string]: any } = {};
    if (customFieldMappings) {
      for (const mapping of customFieldMappings) {
        field_mappings[mapping.slug] = contact.custom_fields[mapping.remote_id];
      }
    }
    const emailHandle = contact.handles.find(
      (handle) => handle.source === 'email',
    );
    const phoneHandle = contact.handles.find(
      (handle) => handle.source === 'phone',
    );

    const unifiedContact: UnifiedContactOutput = {
      remote_id: contact.id,
      name: contact.name,
      email_address: emailHandle.handle || '',
      phone_number: phoneHandle.handle || '',
      field_mappings: field_mappings,
    };

    return unifiedContact;
  }
}