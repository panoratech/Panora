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

    return sourcesArray.map((ticket) =>
      this.mapSingleTicketToUnified(ticket, customFieldMappings),
    );
  }

  private mapSingleTicketToUnified(
    ticket: FrontContactOutput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): UnifiedContactOutput {
    return;
  }
}
