import { MappersRegistry } from '@@core/@core-services/registries/mappers.registry';
import { CoreUnification } from '@@core/@core-services/unification/core-unification.service';
import { IngestDataService } from '@@core/@core-services/unification/ingest-data.service';
import { Utils } from '@hris/@lib/@utils';
import { ITimeoffBalanceMapper } from '@hris/timeoffbalance/types';
import {
  UnifiedHrisTimeoffbalanceInput,
  UnifiedHrisTimeoffbalanceOutput,
} from '@hris/timeoffbalance/types/model.unified';
import { Injectable } from '@nestjs/common';
import { SageTimeoffbalanceOutput } from './types';

@Injectable()
export class SageTimeoffbalanceMapper implements ITimeoffBalanceMapper {
  constructor(
    private mappersRegistry: MappersRegistry,
    private utils: Utils,
    private ingestService: IngestDataService,
    private coreUnificationService: CoreUnification,
  ) {
    this.mappersRegistry.registerService(
      'hris',
      'timeoffbalance',
      'sage',
      this,
    );
  }

  async desunify(
    source: UnifiedHrisTimeoffbalanceInput,
    customFieldMappings?: { slug: string; remote_id: string }[],
  ): Promise<any> {
    return;
  }

  async unify(
    source: SageTimeoffbalanceOutput | SageTimeoffbalanceOutput[],
    connectionId: string,
    customFieldMappings?: { slug: string; remote_id: string }[],
  ): Promise<
    UnifiedHrisTimeoffbalanceOutput | UnifiedHrisTimeoffbalanceOutput[]
  > {
    if (!Array.isArray(source)) {
      return this.mapSingleTimeoffbalanceToUnified(
        source,
        connectionId,
        customFieldMappings,
      );
    }
    return Promise.all(
      source.map((timeoffbalance) =>
        this.mapSingleTimeoffbalanceToUnified(
          timeoffbalance,
          connectionId,
          customFieldMappings,
        ),
      ),
    );
  }

  private async mapSingleTimeoffbalanceToUnified(
    timeoffbalance: SageTimeoffbalanceOutput,
    connectionId: string,
    customFieldMappings?: { slug: string; remote_id: string }[],
  ): Promise<UnifiedHrisTimeoffbalanceOutput> {
    return {
      remote_id: null,
      remote_data: timeoffbalance,
      balance: timeoffbalance.available,
      used: timeoffbalance.used,
    };
  }
}
