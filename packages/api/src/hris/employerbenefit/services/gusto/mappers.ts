import { MappersRegistry } from '@@core/@core-services/registries/mappers.registry';
import { CoreUnification } from '@@core/@core-services/unification/core-unification.service';
import { IngestDataService } from '@@core/@core-services/unification/ingest-data.service';
import { Injectable } from '@nestjs/common';
import { GustoCategory, GustoEmployerbenefitOutput } from './types';
import {
  BenefitPlanType,
  UnifiedHrisEmployerbenefitInput,
  UnifiedHrisEmployerbenefitOutput,
} from '@hris/employerbenefit/types/model.unified';
import { IEmployerBenefitMapper } from '@hris/employerbenefit/types';
import { Utils } from '@hris/@lib/@utils';

@Injectable()
export class GustoEmployerbenefitMapper implements IEmployerBenefitMapper {
  constructor(
    private mappersRegistry: MappersRegistry,
    private utils: Utils,
    private ingestService: IngestDataService,
    private coreUnificationService: CoreUnification,
  ) {
    this.mappersRegistry.registerService(
      'hris',
      'employerbenefit',
      'gusto',
      this,
    );
  }

  async desunify(
    source: UnifiedHrisEmployerbenefitInput,
    customFieldMappings?: { slug: string; remote_id: string }[],
  ): Promise<any> {
    return;
  }

  async unify(
    source: GustoEmployerbenefitOutput | GustoEmployerbenefitOutput[],
    connectionId: string,
    customFieldMappings?: { slug: string; remote_id: string }[],
  ): Promise<
    UnifiedHrisEmployerbenefitOutput | UnifiedHrisEmployerbenefitOutput[]
  > {
    if (!Array.isArray(source)) {
      return this.mapSingleEmployerbenefitToUnified(
        source,
        connectionId,
        customFieldMappings,
      );
    }
    return Promise.all(
      source.map((employerbenefit) =>
        this.mapSingleEmployerbenefitToUnified(
          employerbenefit,
          connectionId,
          customFieldMappings,
        ),
      ),
    );
  }

  private async mapSingleEmployerbenefitToUnified(
    employerbenefit: GustoEmployerbenefitOutput,
    connectionId: string,
    customFieldMappings?: { slug: string; remote_id: string }[],
  ): Promise<UnifiedHrisEmployerbenefitOutput> {
    return {
      remote_id: employerbenefit.uuid || null,
      remote_data: employerbenefit,
      benefit_plan_type: this.mapGustoBenefitToPanora(employerbenefit.category),
      name: employerbenefit.name,
      description: employerbenefit.description,
    };
  }

  mapGustoBenefitToPanora(
    category: GustoCategory | string,
  ): BenefitPlanType | string {
    switch (category) {
      case 'Health':
        return 'MEDICAL';
      case 'Savings and Retirement':
        return 'RETIREMENT';
      case 'Other':
        return 'OTHER';
      default:
        return category;
    }
  }
}
