import { ICollectionMapper } from '@ticketing/collection/types';
import { LinearCollectionInput, LinearCollectionOutput } from './types';
import {
  UnifiedTicketingCollectionInput,
  UnifiedTicketingCollectionOutput,
} from '@ticketing/collection/types/model.unified';
import { MappersRegistry } from '@@core/@core-services/registries/mappers.registry';
import { Injectable } from '@nestjs/common';
import { Utils } from '@ticketing/@lib/@utils';

@Injectable()
export class LinearCollectionMapper implements ICollectionMapper {
  constructor(private mappersRegistry: MappersRegistry, private utils: Utils) {
    this.mappersRegistry.registerService(
      'ticketing',
      'collection',
      'linear',
      this,
    );
  }
  desunify(
    source: UnifiedTicketingCollectionInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): LinearCollectionInput {
    return;
  }

  unify(
    source: LinearCollectionOutput | LinearCollectionOutput[],
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): UnifiedTicketingCollectionOutput | UnifiedTicketingCollectionOutput[] {
    // If the source is not an array, convert it to an array for mapping
    const sourcesArray = Array.isArray(source) ? source : [source];

    return sourcesArray.map((collection) =>
      this.mapSingleCollectionToUnified(
        collection,
        connectionId,
        customFieldMappings,
      ),
    );
  }

  private mapSingleCollectionToUnified(
    collection: LinearCollectionOutput,
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): UnifiedTicketingCollectionOutput {
    const unifiedCollection: UnifiedTicketingCollectionOutput = {
      remote_id: collection.id,
      remote_data: collection,
      name: collection.name,
      description: collection.description,
      collection_type: 'PROJECT',
    };

    return unifiedCollection;
  }
}
