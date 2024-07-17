import { ZohoStageOutput, ZohoStageInput } from './types';
import {
  UnifiedStageInput,
  UnifiedStageOutput,
} from '@crm/stage/types/model.unified';
import { IStageMapper } from '@crm/stage/types';
import { MappersRegistry } from '@@core/@core-services/registries/mappers.registry';
import { Injectable } from '@nestjs/common';
import { Utils } from '@crm/@lib/@utils';

@Injectable()
export class ZohoStageMapper implements IStageMapper {
  constructor(private mappersRegistry: MappersRegistry, private utils: Utils) {
    this.mappersRegistry.registerService('crm', 'stage', 'zoho', this);
  }
  desunify(
    source: UnifiedStageInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): ZohoStageInput {
    return;
  }

  unify(
    source: ZohoStageOutput | ZohoStageOutput[],
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): UnifiedStageOutput | UnifiedStageOutput[] {
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
    stage: ZohoStageOutput,
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): UnifiedStageOutput {
    return {
      remote_id: null,
      remote_data: stage,
      stage_name: stage.Stage_Name,
    };
  }
}
