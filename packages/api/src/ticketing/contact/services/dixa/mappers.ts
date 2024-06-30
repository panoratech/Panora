import { IContactMapper } from '@ticketing/contact/types';
import { DixaContactInput, DixaContactOutput } from './types';
import {
  UnifiedContactInput,
  UnifiedContactOutput,
} from '@ticketing/contact/types/model.unified';
import { MappersRegistry } from '@@core/utils/registry/mappings.registry';
import { Injectable } from '@nestjs/common';
import { Utils } from '@ticketing/@lib/@utils';

@Injectable()
export class DixaContactMapper implements IContactMapper {
  constructor(private mappersRegistry: MappersRegistry, private utils: Utils) {
    this.mappersRegistry.registerService('ticketing', 'contact', 'Dixa', this);
  }
  desunify(
    source: UnifiedContactInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): DixaContactInput {
    return;
  }

  unify(
    source: DixaContactOutput | DixaContactOutput[],
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): UnifiedContactOutput | UnifiedContactOutput[] {
    // If the source is not an array, convert it to an array for mapping
    const sourcesArray = Array.isArray(source) ? source : [source];

    return sourcesArray.map((contact) =>
      this.mapSingleContactToUnified(contact, customFieldMappings),
    );
  }

  private mapSingleContactToUnified(
    contact: DixaContactOutput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): UnifiedContactOutput {
    const field_mappings: { [key: string]: any } = {};
    if (customFieldMappings) {
      for (const mapping of customFieldMappings) {
        field_mappings[mapping.slug] = contact._type[mapping.remote_id];
      }
    }
    // const emailHandle = contact.handles.find(
    //   (handle) => handle.source === 'email',
    // );
    // const phoneHandle = contact.handles.find(
    //   (handle) => handle.source === 'phone',
    // );

    const unifiedContact: UnifiedContactOutput = {
      remote_id: contact._type,
      name: contact.name,
      details: contact.address,
      email_address: contact.senderOverride,
      field_mappings: field_mappings,
    };

    return unifiedContact;
  }
}
