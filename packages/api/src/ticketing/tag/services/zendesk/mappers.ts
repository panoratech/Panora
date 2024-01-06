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
    return source.map((tag) =>
      this.mapSingleTagToUnified(tag, customFieldMappings),
    );
  }

  private mapSingleTagToUnified(
    tag: ZendeskTagOutput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): UnifiedTagOutput {
    const unifiedTag: UnifiedTagOutput = {
      name: tag.tags[0], //TODO
    };

    return unifiedTag;
  }
}
