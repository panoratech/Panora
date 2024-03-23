import { ICollectionMapper } from '@ticketing/collection/types';
import { JiraCollectionInput, JiraCollectionOutput } from './types';
import {
  UnifiedCollectionInput,
  UnifiedCollectionOutput,
} from '@ticketing/collection/types/model.unified';

export class JiraCollectionMapper implements ICollectionMapper {
  desunify(
    source: UnifiedCollectionInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): JiraCollectionInput {
    return;
  }

  unify(
    source: JiraCollectionOutput | JiraCollectionOutput[],
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
    collection: JiraCollectionOutput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): UnifiedCollectionOutput {
    const unifiedCollection: UnifiedCollectionOutput = {
      name: collection.name,
      description: collection.name,
      collection_type: 'PROJECT',
    };

    return unifiedCollection;
  }
}
