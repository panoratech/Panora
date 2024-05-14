import { ICollectionMapper } from '@ticketing/collection/types';
<<<<<<< HEAD
import { GitlabCollectionInput, GitlabCollectionOutput } from './types';
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
            description: source.description ? source.description : '',
            path: source.name
        }

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
            remote_id: String(collection.id),
            name: collection.name,
            description: collection.name,
            collection_type: 'PROJECT',
        };

        return unifiedCollection;
    }
=======
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
    if (customFieldMappings && source.field_mappings) {
      for (const [k, v] of Object.entries(source.field_mappings)) {
        const mapping = customFieldMappings.find(
          (mapping) => mapping.slug === k,
        );
        if (mapping) {
          result[mapping.remote_id] = v;
        }
      }
    }
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
    const field_mappings: { [key: string]: any } = {};

    if (customFieldMappings && collection.custom_attributes) {
      for (const mapping of customFieldMappings) {
        field_mappings[mapping.slug] =
          collection.custom_attributes[mapping.remote_id];
      }
    }
    return unifiedCollection;
  }
>>>>>>> gitlab-connector-with-pagination-feat
}
