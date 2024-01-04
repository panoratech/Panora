import { ITagMapper } from '@ticketing/tag/types';
import { ZendeskTagInput, ZendeskTagOutput } from './types';
import {
  UnifiedTagInput,
  UnifiedTagOutput,
} from '@ticketing/tag/types/model.unified';

export class ZendeskTagMapper implements ITagMapper {
  desunify(
    source: UnifiedTagInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): ZendeskTagInput {
    return;
  }

  unify(
    source: ZendeskTagOutput | ZendeskTagOutput[],
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): UnifiedTagOutput | UnifiedTagOutput[] {
    if (!Array.isArray(source)) {
      return this.mapSingleTagToUnified(source, customFieldMappings);
    }
    return source.map((ticket) =>
      this.mapSingleTagToUnified(ticket, customFieldMappings),
    );
  }

  private mapSingleTagToUnified(
    ticket: ZendeskTagOutput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): UnifiedTagOutput {
    return;
  }
}
