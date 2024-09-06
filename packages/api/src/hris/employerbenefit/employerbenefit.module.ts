import { Module } from '@nestjs/common';
import { EmployerBenefitController } from './employerbenefit.controller';
import { EmployerBenefitService } from './services/employerbenefit.service';
import { ServiceRegistry } from './services/registry.service';
import { SyncService } from './sync/sync.service';
import { IngestDataService } from '@@core/@core-services/unification/ingest-data.service';
import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
import { CoreUnification } from '@@core/@core-services/unification/core-unification.service';
import { GustoEmployerbenefitMapper } from './services/gusto/mappers';
import { GustoService } from './services/gusto';
import { Utils } from '@hris/@lib/@utils';
@Module({
  controllers: [EmployerBenefitController],
  providers: [
    EmployerBenefitService,
    CoreUnification,
    SyncService,
    WebhookService,
    ServiceRegistry,
    Utils,
    IngestDataService,
    GustoEmployerbenefitMapper,
    /* PROVIDERS SERVICES */
    GustoService,
  ],
  exports: [SyncService],
})
export class EmployerBenefitModule {}
