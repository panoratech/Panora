import { Injectable } from '@nestjs/common';
import { MappersRegistry } from '@@core/@core-services/registries/mappers.registry';
import { CoreUnification } from '@@core/@core-services/unification/core-unification.service';
import { IngestDataService } from '@@core/@core-services/unification/ingest-data.service';
import { Utils } from '@hris/@lib/@utils';
import { IEmploymentMapper } from '@hris/employment/types';
import {
  FlsaStatus,
  UnifiedHrisEmploymentInput,
  UnifiedHrisEmploymentOutput,
  EmploymentType,
  PayFrequency,
  PayPeriod,
} from '@hris/employment/types/model.unified';
import { DeelEmploymentOutput } from './types';
import { CurrencyCode } from '@@core/utils/types';

@Injectable()
export class DeelEmploymentMapper implements IEmploymentMapper {
  constructor(
    private mappersRegistry: MappersRegistry,
    private utils: Utils,
    private ingestService: IngestDataService,
    private coreUnificationService: CoreUnification,
  ) {
    this.mappersRegistry.registerService('hris', 'employment', 'deel', this);
  }

  async desunify(
    source: UnifiedHrisEmploymentInput,
    customFieldMappings?: { slug: string; remote_id: string }[],
  ): Promise<any> {
    // Implementation for desunify (if needed)
    return;
  }

  async unify(
    source: DeelEmploymentOutput | DeelEmploymentOutput[],
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
    employment: DeelEmploymentOutput,
    connectionId: string,
    customFieldMappings?: { slug: string; remote_id: string }[],
  ): Promise<UnifiedHrisEmploymentOutput> {
    return {
      remote_id: employment.id,
      remote_data: employment,
      job_title: employment.job_title,
      pay_rate: employment.payment?.rate,
      pay_period: this.mapPayPeriod(employment.payment?.scale),
      pay_frequency: this.mapPayFrequency(employment.payment?.scale),
      pay_currency: employment.payment?.currency as CurrencyCode,
      flsa_status: this.mapFlsaStatus(employment.hiring_type),
      effective_date: employment.start_date
        ? new Date(employment.start_date)
        : null,
      employment_type: this.mapEmploymentType(employment.hiring_type),
    };
  }

  private mapPayPeriod(scale?: string): PayPeriod | undefined {
    switch (scale?.toLowerCase()) {
      case 'yearly':
        return 'YEAR';
      case 'monthly':
        return 'MONTH';
      case 'weekly':
        return 'WEEK';
      case 'daily':
        return 'DAY';
      case 'hourly':
        return 'HOUR';
      default:
        return undefined;
    }
  }

  private mapPayFrequency(scale?: string): PayFrequency | undefined {
    switch (scale?.toLowerCase()) {
      case 'yearly':
        return 'ANNUALLY';
      case 'monthly':
        return 'MONTHLY';
      case 'weekly':
        return 'WEEKLY';
      case 'daily':
        return 'WEEKLY'; // Assuming daily payment is done weekly
      case 'hourly':
        return 'WEEKLY'; // Assuming hourly payment is done weekly
      default:
        return undefined;
    }
  }

  private mapFlsaStatus(hiringType?: string): FlsaStatus | undefined {
    switch (hiringType?.toLowerCase()) {
      case 'employee':
        return 'EXEMPT'; // Assuming employees are exempt
      case 'contractor':
        return 'NONEXEMPT'; // Assuming contractors are nonexempt
      default:
        return undefined;
    }
  }

  private mapEmploymentType(hiringType?: string): EmploymentType | undefined {
    switch (hiringType?.toLowerCase()) {
      case 'employee':
        return 'FULL_TIME'; // Assuming employees are full-time
      case 'contractor':
        return 'CONTRACTOR';
      default:
        return undefined;
    }
  }
}
