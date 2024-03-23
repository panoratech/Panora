import { ITagMapper } from '@ticketing/tag/types';
import { JiraTagInput, JiraTagOutput } from './types';
import {
  UnifiedTagInput,
  UnifiedTagOutput,
} from '@ticketing/tag/types/model.unified';

export class JiraTagMapper implements ITagMapper {
  desunify(
    source: UnifiedTagInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): JiraTagInput {
    return;
  }

  unify(
    source: JiraTagOutput | JiraTagOutput[],
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
    tag: JiraTagOutput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): UnifiedTagOutput {
    const unifiedTag: UnifiedTagOutput = {
      name: tag.name,
    };

    return unifiedTag;
  }
}
