import { MappersRegistry } from '@@core/@core-services/registries/mappers.registry';
import { CoreUnification } from '@@core/@core-services/unification/core-unification.service';
import { IngestDataService } from '@@core/@core-services/unification/ingest-data.service';
import { Injectable } from '@nestjs/common';
import { GustoGroupOutput } from './types';
import {
  UnifiedHrisGroupInput,
  UnifiedHrisGroupOutput,
} from '@hris/group/types/model.unified';
import { IGroupMapper } from '@hris/group/types';
import { Utils } from '@hris/@lib/@utils';

@Injectable()
export class GustoGroupMapper implements IGroupMapper {
  constructor(
    private mappersRegistry: MappersRegistry,
    private utils: Utils,
    private ingestService: IngestDataService,
    private coreUnificationService: CoreUnification,
  ) {
    this.mappersRegistry.registerService('hris', 'group', 'gusto', this);
  }

  async desunify(
    source: UnifiedHrisGroupInput,
    customFieldMappings?: { slug: string; remote_id: string }[],
  ): Promise<any> {
    return;
  }

  async unify(
    source: GustoGroupOutput | GustoGroupOutput[],
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
    group: GustoGroupOutput,
    connectionId: string,
    customFieldMappings?: { slug: string; remote_id: string }[],
  ): Promise<UnifiedHrisGroupOutput> {
    return {
      remote_id: group.uuid || null,
      remote_data: group,
      name: group.title,
    };
  }
}
