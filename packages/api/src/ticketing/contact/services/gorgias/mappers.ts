import { IContactMapper } from '@ticketing/contact/types';
import { GorgiasContactInput, GorgiasContactOutput } from './types';
import {
  UnifiedContactInput,
  UnifiedContactOutput,
} from '@ticketing/contact/types/model.unified';

export class GorgiasContactMapper implements IContactMapper {
  desunify(
    source: UnifiedContactInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): GorgiasContactInput {
    return;
  }

  unify(
    source: GorgiasContactOutput | GorgiasContactOutput[],
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
    contact: GorgiasContactOutput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): UnifiedContactOutput {
    const unifiedContact: UnifiedContactOutput = {
      remote_id: String(contact.id),
      name: contact.name,
      email_address: contact.email,
    };

    return unifiedContact;
  }
}
