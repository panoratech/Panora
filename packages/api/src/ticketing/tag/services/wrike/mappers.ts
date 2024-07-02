import { MappersRegistry } from "@@core/utils/registry/mappings.registry";
import { Injectable } from "@nestjs/common";
import { Utils } from "@ticketing/@lib/@utils";
import { ITagMapper } from "@ticketing/tag/types";
import { UnifiedTagInput, UnifiedTagOutput } from "@ticketing/tag/types/model.unified";
import { WrikeTagInput, WrikeTagOutput } from "./types";

@Injectable()
export class WrikeTagMapper implements ITagMapper {
  constructor(private mappersRegistry: MappersRegistry, private utils: Utils) {
    this.mappersRegistry.registerService('ticketing', 'tag', 'wrike', this);
  }
  desunify(
    source: UnifiedTagInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): WrikeTagInput {
    return;
  }

  unify(
    source: WrikeTagOutput | WrikeTagOutput[],
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
    tag: WrikeTagOutput,
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