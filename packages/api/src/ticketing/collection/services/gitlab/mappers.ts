import { ICollectionMapper } from '@ticketing/collection/types';

import { GitlabCollectionOutput, GitlabCollectionInput } from './types';
import {
  UnifiedCollectionInput,
  UnifiedCollectionOutput,
} from '@ticketing/collection/types/model.unified';

export class GitlabCollectionMapper implements ICollectionMapper {
  desunify(
    source: UnifiedCollectionInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): GitlabCollectionInput {
    const result: GitlabCollectionInput = {
      name: source.name,
      description: source.description ?? '',
      path: source.name,
    };
    return result;
  }

  unify(
    source: GitlabCollectionOutput | GitlabCollectionOutput[],
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): UnifiedCollectionOutput | UnifiedCollectionOutput[] {
    // If the source is not an array, convert it to an array for mapping
    const sourcesArray = Array.isArray(source) ? source : [source];

    return sourcesArray.map((collection) =>
      this.mapSingleCollectionToUnified(collection, customFieldMappings),
    );
  }

  private mapSingleCollectionToUnified(
    collection: GitlabCollectionOutput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): UnifiedCollectionOutput {
    const unifiedCollection: UnifiedCollectionOutput = {
      remote_id: `${collection.id}`,
      name: collection.name,
      description: collection.description,
      collection_type: 'PROJECT',
    };
    return unifiedCollection;
  }
}
