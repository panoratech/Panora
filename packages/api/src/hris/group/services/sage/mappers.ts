import { MappersRegistry } from '@@core/@core-services/registries/mappers.registry';
import { CoreUnification } from '@@core/@core-services/unification/core-unification.service';
import { IngestDataService } from '@@core/@core-services/unification/ingest-data.service';
import { Utils } from '@hris/@lib/@utils';
import { IGroupMapper } from '@hris/group/types';
import {
  UnifiedHrisGroupInput,
  UnifiedHrisGroupOutput,
} from '@hris/group/types/model.unified';
import { Injectable } from '@nestjs/common';
import { SageGroupOutput } from './types';

@Injectable()
export class SageGroupMapper implements IGroupMapper {
  constructor(
    private mappersRegistry: MappersRegistry,
    private utils: Utils,
    private ingestService: IngestDataService,
    private coreUnificationService: CoreUnification,
  ) {
    this.mappersRegistry.registerService('hris', 'group', 'sage', this);
  }

  async desunify(
    source: UnifiedHrisGroupInput,
    customFieldMappings?: { slug: string; remote_id: string }[],
  ): Promise<any> {
    return;
  }

  async unify(
    source: SageGroupOutput | SageGroupOutput[],
    connectionId: string,
    customFieldMappings?: { slug: string; remote_id: string }[],
  ): Promise<UnifiedHrisGroupOutput | UnifiedHrisGroupOutput[]> {
    if (!Array.isArray(source)) {
      return this.mapSingleGroupToUnified(
        source,
        connectionId,
        customFieldMappings,
      );
    }
    return Promise.all(
      source.map((group) =>
        this.mapSingleGroupToUnified(group, connectionId, customFieldMappings),
      ),
    );
  }

  private async mapSingleGroupToUnified(
    group: SageGroupOutput,
    connectionId: string,
    customFieldMappings?: { slug: string; remote_id: string }[],
  ): Promise<UnifiedHrisGroupOutput> {
    return {
      remote_id: String(group.id),
      remote_data: group,
      name: group.name,
    };
  }
}
