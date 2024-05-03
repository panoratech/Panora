import { ITagMapper } from '@ticketing/tag/types';
import { FrontTagInput, FrontTagOutput } from './types';
import {
  UnifiedTagInput,
  UnifiedTagOutput,
} from '@ticketing/tag/types/model.unified';

export class FrontTagMapper implements ITagMapper {
  desunify(
    source: UnifiedTagInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): FrontTagInput {
    return;
  }

  unify(
    source: FrontTagOutput | FrontTagOutput[],
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): UnifiedTagOutput | UnifiedTagOutput[] {
    // If the source is not an array, convert it to an array for mapping
    const sourcesArray = Array.isArray(source) ? source : [source];

    return sourcesArray.map((tag) =>
      this.mapSingleTagToUnified(tag, customFieldMappings),
    );
  }

  private mapSingleTagToUnified(
    tag: FrontTagOutput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): UnifiedTagOutput {
    const unifiedTag: UnifiedTagOutput = {
      remote_id: tag.id,
      name: tag.name,
    };

    return unifiedTag;
  }
}
