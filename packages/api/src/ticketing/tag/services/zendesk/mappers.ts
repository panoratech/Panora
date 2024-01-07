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
    source: ZendeskTagOutput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): UnifiedTagOutput | UnifiedTagOutput[] {
    const tags = source.tags;

    return tags.map((tag) =>
      this.mapSingleTagToUnified(tag, customFieldMappings),
    );
  }

  private mapSingleTagToUnified(
    tag: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): UnifiedTagOutput {
    const unifiedTag: UnifiedTagOutput = {
      name: tag,
    };

    return unifiedTag;
  }
}
