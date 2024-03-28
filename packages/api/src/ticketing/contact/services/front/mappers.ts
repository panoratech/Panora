import { IContactMapper } from '@ticketing/contact/types';
import { FrontContactInput, FrontContactOutput } from './types';
import {
  UnifiedContactInput,
  UnifiedContactOutput,
} from '@ticketing/contact/types/model.unified';

export class FrontContactMapper implements IContactMapper {
  desunify(
    source: UnifiedContactInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): FrontContactInput {
    return;
  }

  unify(
    source: FrontContactOutput | FrontContactOutput[],
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
    contact: FrontContactOutput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): UnifiedContactOutput {
    const field_mappings = customFieldMappings?.map((mapping) => ({
      [mapping.slug]: contact.custom_fields?.[mapping.remote_id],
    }));
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
