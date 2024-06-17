import { ICollectionMapper } from '@ticketing/collection/types';
import { GitlabCollectionInput, GitlabCollectionOutput } from './types';
import {
  UnifiedCollectionInput,
  UnifiedCollectionOutput,
} from '@ticketing/collection/types/model.unified';
import { MappersRegistry } from '@@core/utils/registry/mappings.registry';
import { Injectable } from '@nestjs/common';
import { Utils } from '@ticketing/@lib/@utils';

@Injectable()
export class GitlabCollectionMapper implements ICollectionMapper {
  constructor(private mappersRegistry: MappersRegistry, private utils: Utils) {
    this.mappersRegistry.registerService(
      'ticketing',
      'collection',
      'gitlab',
      this,
    );
  }
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
      remote_id: String(collection.id),
      name: collection.name,
      description: collection.name,
      collection_type: 'PROJECT',
    };

    return unifiedCollection;
  }
}
