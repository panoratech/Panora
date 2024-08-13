import { MappersRegistry } from '@@core/@core-services/registries/mappers.registry';
import { CoreUnification } from '@@core/@core-services/unification/core-unification.service';
import { IngestDataService } from '@@core/@core-services/unification/ingest-data.service';
import { Utils } from '@hris/@lib/@utils';
import { IEmploymentMapper } from '@hris/employment/types';
import {
  FlsaStatus,
  UnifiedHrisEmploymentInput,
  UnifiedHrisEmploymentOutput,
} from '@hris/employment/types/model.unified';
import { Injectable } from '@nestjs/common';
import { GustoEmploymentOutput } from './types';

@Injectable()
export class GustoEmploymentMapper implements IEmploymentMapper {
  constructor(
    private mappersRegistry: MappersRegistry,
    private utils: Utils,
    private ingestService: IngestDataService,
    private coreUnificationService: CoreUnification,
  ) {
    this.mappersRegistry.registerService('hris', 'employment', 'gusto', this);
  }

  async desunify(
    source: UnifiedHrisEmploymentInput,
    customFieldMappings?: { slug: string; remote_id: string }[],
  ): Promise<any> {
    return;
  }

  async unify(
    source: GustoEmploymentOutput | GustoEmploymentOutput[],
    connectionId: string,
    customFieldMappings?: { slug: string; remote_id: string }[],
  ): Promise<UnifiedHrisEmploymentOutput | UnifiedHrisEmploymentOutput[]> {
    if (!Array.isArray(source)) {
      return this.mapSingleEmploymentToUnified(
        source,
        connectionId,
        customFieldMappings,
      );
    }
    return Promise.all(
      source.map((employment) =>
        this.mapSingleEmploymentToUnified(
          employment,
          connectionId,
          customFieldMappings,
        ),
      ),
    );
  }

  private async mapSingleEmploymentToUnified(
    employment: GustoEmploymentOutput,
    connectionId: string,
    customFieldMappings?: { slug: string; remote_id: string }[],
  ): Promise<UnifiedHrisEmploymentOutput> {
    return {
      remote_id: employment.uuid,
      remote_data: employment,
      effective_date: new Date(employment.effective_date),
      job_title: employment.title,
      pay_rate: Number(employment.rate),
      flsa_status: this.mapFlsaStatusToPanora(employment.flsa_status),
    };
  }

  mapFlsaStatusToPanora(
    str:
      | 'Exempt'
      | 'Salaried Nonexempt'
      | 'Nonexempt'
      | 'Owner'
      | 'Commission Only Exempt'
      | 'Commission Only Nonexempt',
  ): FlsaStatus | string {
    switch (str) {
      case 'Exempt':
        return 'EXEMPT';
      case 'Salaried Nonexempt':
        return 'SALARIED_NONEXEMPT';
      case 'Nonexempt':
        return 'NONEXEMPT';
      case 'Owner':
        return 'OWNER';
      default:
        return str;
    }
  }
}
