import { MappersRegistry } from '@@core/@core-services/registries/mappers.registry';
import { CoreUnification } from '@@core/@core-services/unification/core-unification.service';
import { IngestDataService } from '@@core/@core-services/unification/ingest-data.service';
import { Injectable } from '@nestjs/common';
import { GustoBenefitOutput } from './types';
import {
  UnifiedHrisBenefitInput,
  UnifiedHrisBenefitOutput,
} from '@hris/benefit/types/model.unified';
import { IBenefitMapper } from '@hris/benefit/types';
import { Utils } from '@hris/@lib/@utils';

@Injectable()
export class GustoBenefitMapper implements IBenefitMapper {
  constructor(
    private mappersRegistry: MappersRegistry,
    private utils: Utils,
    private ingestService: IngestDataService,
    private coreUnificationService: CoreUnification,
  ) {
    this.mappersRegistry.registerService('hris', 'benefit', 'gusto', this);
  }

  async desunify(
    source: UnifiedHrisBenefitInput,
    customFieldMappings?: { slug: string; remote_id: string }[],
  ): Promise<any> {
    return;
  }

  async unify(
    source: GustoBenefitOutput | GustoBenefitOutput[],
    connectionId: string,
    customFieldMappings?: { slug: string; remote_id: string }[],
  ): Promise<UnifiedHrisBenefitOutput | UnifiedHrisBenefitOutput[]> {
    if (!Array.isArray(source)) {
      return this.mapSingleBenefitToUnified(
        source,
        connectionId,
        customFieldMappings,
      );
    }
    return Promise.all(
      source.map((benefit) =>
        this.mapSingleBenefitToUnified(
          benefit,
          connectionId,
          customFieldMappings,
        ),
      ),
    );
  }

  private async mapSingleBenefitToUnified(
    benefit: GustoBenefitOutput,
    connectionId: string,
    customFieldMappings?: { slug: string; remote_id: string }[],
  ): Promise<UnifiedHrisBenefitOutput> {
    const opts: any = {};

    if (benefit.employee_uuid) {
      const employee_id = await this.utils.getEmployeeUuidFromRemoteId(
        benefit.employee_uuid,
        connectionId,
      );
      if (employee_id) {
        opts.employee_id = employee_id;
      }
    }
    if (benefit.company_benefit_uuid) {
      const id = await this.utils.getEmployerBenefitUuidFromRemoteId(
        benefit.company_benefit_uuid,
        connectionId,
      );
      if (id) {
        opts.employer_benefit_id = id;
      }
    }

    return {
      remote_id: benefit.uuid || null,
      remote_data: benefit,
      ...opts,
      employee_contribution: benefit.employee_deduction
        ? parseFloat(benefit.employee_deduction)
        : null,
      company_contribution: benefit.company_contribution
        ? parseFloat(benefit.company_contribution)
        : null,
      remote_was_deleted: null,
    };
  }
}
