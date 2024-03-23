import { ICollectionMapper } from '@ticketing/collection/types';
import { GorgiasCollectionInput, GorgiasCollectionOutput } from './types';
import {
  UnifiedCollectionInput,
  UnifiedCollectionOutput,
} from '@ticketing/collection/types/model.unified';

export class GorgiasCollectionMapper implements ICollectionMapper {
  desunify(
    source: UnifiedCollectionInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): GorgiasCollectionInput {
    return;
  }

  unify(
    source: GorgiasCollectionOutput | GorgiasCollectionOutput[],
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
    collection: GorgiasCollectionOutput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): UnifiedCollectionOutput {
    const unifiedCollection: UnifiedCollectionOutput = {
      name: collection.name,
    };

    return unifiedCollection;
  }
}
