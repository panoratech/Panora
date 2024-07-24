import { HubspotStageOutput, HubspotStageInput } from './types';
import {
  UnifiedCrmStageInput,
  UnifiedCrmStageOutput,
} from '@crm/stage/types/model.unified';
import { IStageMapper } from '@crm/stage/types';
import { MappersRegistry } from '@@core/@core-services/registries/mappers.registry';
import { Injectable } from '@nestjs/common';
import { Utils } from '@crm/@lib/@utils';

@Injectable()
export class HubspotStageMapper implements IStageMapper {
  constructor(private mappersRegistry: MappersRegistry, private utils: Utils) {
    this.mappersRegistry.registerService('crm', 'stage', 'hubspot', this);
  }

  desunify(
    source: UnifiedCrmStageInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): HubspotStageInput {
    return;
  }

  unify(
    source: HubspotStageOutput | HubspotStageOutput[],
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): UnifiedCrmStageOutput | UnifiedCrmStageOutput[] {
    if (!Array.isArray(source)) {
      return this.mapSingleStageToUnified(
        source,
        connectionId,
        customFieldMappings,
      );
    }
    // Handling array of HubspotStageOutput
    return source.map((stage) =>
      this.mapSingleStageToUnified(stage, connectionId, customFieldMappings),
    );
  }

  private mapSingleStageToUnified(
    stage: HubspotStageOutput,
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): UnifiedCrmStageOutput {
    const field_mappings: { [key: string]: any } = {};
    if (customFieldMappings) {
      for (const mapping of customFieldMappings) {
        field_mappings[mapping.slug] = stage[mapping.remote_id];
      }
    }
    return {
      remote_id: stage.stageId,
      remote_data: stage,
      stage_name: stage.label,
      field_mappings,
    };
  }
}
