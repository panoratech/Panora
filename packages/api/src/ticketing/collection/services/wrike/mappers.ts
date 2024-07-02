import { MappersRegistry } from "@@core/utils/registry/mappings.registry";
import { Injectable } from "@nestjs/common";
import { Utils } from "@ticketing/@lib/@utils";
import { ICollectionMapper } from "@ticketing/collection/types";
import { UnifiedCollectionInput, UnifiedCollectionOutput } from "@ticketing/collection/types/model.unified";
import { WrikeCollectionInput, WrikeCollectionOutput } from "./types";

@Injectable()
export class WrikeCollectionMapper implements ICollectionMapper {
  constructor(private mappersRegistry: MappersRegistry, private utils: Utils) {
    this.mappersRegistry.registerService(
      'ticketing',
      'collection',
      'wrike',
      this,
    );
  }
  desunify(
    source: UnifiedCollectionInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): WrikeCollectionInput {
    return;
  }

  unify(
    source: WrikeCollectionOutput | WrikeCollectionOutput[],
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): UnifiedCollectionOutput | UnifiedCollectionOutput[] {
    const sourcesArray = Array.isArray(source) ? source : [source];

    return sourcesArray.map((collection) =>
      this.mapSingleCollectionToUnified(collection, customFieldMappings),
    );
  }

  private mapSingleCollectionToUnified(
    collection: WrikeCollectionOutput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): UnifiedCollectionOutput {
    const unifiedCollection: UnifiedCollectionOutput = {
      remote_id: collection.id,
      name: collection.name,
      description: collection.name,
      collection_type: 'PROJECT',
    };

    return unifiedCollection;
  }
}