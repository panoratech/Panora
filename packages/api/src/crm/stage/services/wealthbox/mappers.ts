import { WealthboxStageOutput, WealthboxStageInput } from './types';
import {
  UnifiedCrmStageInput,
  UnifiedCrmStageOutput,
} from '@crm/stage/types/model.unified';
import { IStageMapper } from '@crm/stage/types';
import { MappersRegistry } from '@@core/@core-services/registries/mappers.registry';
import { Injectable } from '@nestjs/common';
import { Utils } from '@crm/@lib/@utils';

@Injectable()
export class WealthboxStageMapper implements IStageMapper {
  constructor(private mappersRegistry: MappersRegistry, private utils: Utils) {
    this.mappersRegistry.registerService('crm', 'stage', 'wealthbox', this);
  }

  desunify(
    source: UnifiedCrmStageInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): WealthboxStageInput {
    return;
  }

  unify(
    source: WealthboxStageOutput | WealthboxStageOutput[],
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): UnifiedCrmStageOutput | UnifiedCrmStageOutput[] {
    if(!Array.isArray(source)) {
      return this.mapSingleStageToUnified(
        source,
        connectionId,
        customFieldMappings,
      )
    }

    return source.map((stage) =>
      this.mapSingleStageToUnified(stage, connectionId, customFieldMappings),
    );
  }

  private mapSingleStageToUnified(
    stage: WealthboxStageOutput,
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[]
  ): UnifiedCrmStageOutput {
    const field_mappings: { [key: string]: any } = {};
    if (customFieldMappings) {
      for (const mapping of customFieldMappings) {
        field_mappings[mapping.slug] = stage[mapping.remote_id];
      }
    }

    return {
      remote_id: stage.id.toString(),
      remote_data: stage,
      stage_name: stage.name,
      field_mappings,
    };
  }
}