import {
  AshbyJobInterviewStageInput,
  AshbyJobInterviewStageOutput,
} from './types';
import {
  UnifiedJobInterviewStageInput,
  UnifiedJobInterviewStageOutput,
} from '@ats/jobinterviewstage/types/model.unified';
import { IJobInterviewStageMapper } from '@ats/jobinterviewstage/types';
import { MappersRegistry } from '@@core/@core-services/registries/mappers.registry';
import { Injectable } from '@nestjs/common';
import { CoreUnification } from '@@core/@core-services/unification/core-unification.service';
import { Utils } from '@ats/@lib/@utils';

@Injectable()
export class AshbyJobInterviewStageMapper implements IJobInterviewStageMapper {
  constructor(
    private mappersRegistry: MappersRegistry,
    private utils: Utils,
    private coreUnificationService: CoreUnification,
  ) {
    this.mappersRegistry.registerService(
      'ats',
      'jobinterviewstage',
      'ashby',
      this,
    );
  }

  async desunify(
    source: UnifiedJobInterviewStageInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<AshbyJobInterviewStageInput> {
    return;
  }

  async unify(
    source: AshbyJobInterviewStageOutput | AshbyJobInterviewStageOutput[],
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<
    UnifiedJobInterviewStageOutput | UnifiedJobInterviewStageOutput[]
  > {
    if (!Array.isArray(source)) {
      return await this.mapSingleJobInterviewStageToUnified(
        source,
        connectionId,
        customFieldMappings,
      );
    }
    // Handling array of AshbyJobInterviewStageOutput
    return Promise.all(
      source.map((jobinterviewstage) =>
        this.mapSingleJobInterviewStageToUnified(
          jobinterviewstage,
          connectionId,
          customFieldMappings,
        ),
      ),
    );
  }

  private async mapSingleJobInterviewStageToUnified(
    jobinterviewstage: AshbyJobInterviewStageOutput,
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedJobInterviewStageOutput> {
    return {
      remote_id: jobinterviewstage.id,
      remote_data: jobinterviewstage,
      name: jobinterviewstage.title || null,
      stage_order: jobinterviewstage.orderInInterviewPlan,
    };
  }
}
