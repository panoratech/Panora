import { AshbyActivityInput, AshbyActivityOutput } from './types';
import {
  UnifiedActivityInput,
  UnifiedActivityOutput,
} from '@ats/activity/types/model.unified';
import { IActivityMapper } from '@ats/activity/types';
import { MappersRegistry } from '@@core/@core-services/registries/mappers.registry';
import { Injectable } from '@nestjs/common';
import { CoreUnification } from '@@core/@core-services/unification/core-unification.service';
import { Utils } from '@ats/@lib/@utils';

@Injectable()
export class AshbyActivityMapper implements IActivityMapper {
  constructor(
    private mappersRegistry: MappersRegistry,
    private utils: Utils,
    private coreUnificationService: CoreUnification,
  ) {
    this.mappersRegistry.registerService('ats', 'activity', 'ashby', this);
  }

  async desunify(
    source: UnifiedActivityInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<AshbyActivityInput> {
    return;
  }

  async unify(
    source: AshbyActivityOutput | AshbyActivityOutput[],
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedActivityOutput | UnifiedActivityOutput[]> {
    if (!Array.isArray(source)) {
      return await this.mapSingleActivityToUnified(
        source,
        connectionId,
        customFieldMappings,
      );
    }
    // Handling array of AshbyActivityOutput
    return Promise.all(
      source.map((activity) =>
        this.mapSingleActivityToUnified(
          activity,
          connectionId,
          customFieldMappings,
        ),
      ),
    );
  }

  private async mapSingleActivityToUnified(
    activity: AshbyActivityOutput,
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedActivityOutput> {
    return {
      remote_id: activity.id,
      remote_data: activity,
      subject: null,
      body: activity.content,
      visibility: null,
      remote_created_at: activity.createdAt,
      //remote_created_at: activity.created_at || null,
      //remote_modified_at: activity.modified_at || null,
    };
  }
}
