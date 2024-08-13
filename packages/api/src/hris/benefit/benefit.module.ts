import { Module } from '@nestjs/common';
import { BenefitController } from './benefit.controller';
import { BenefitService } from './services/benefit.service';
import { ServiceRegistry } from './services/registry.service';
import { SyncService } from './sync/sync.service';
import { IngestDataService } from '@@core/@core-services/unification/ingest-data.service';
import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
import { CoreUnification } from '@@core/@core-services/unification/core-unification.service';
import { GustoService } from './services/gusto';
import { GustoBenefitMapper } from './services/gusto/mappers';
import { Utils } from '@hris/@lib/@utils';

@Module({
  controllers: [BenefitController],
  providers: [
    BenefitService,
    SyncService,
    WebhookService,
    ServiceRegistry,
    IngestDataService,
    CoreUnification,
    Utils,
    GustoBenefitMapper,
    /* PROVIDERS SERVICES */
    GustoService,
  ],
  exports: [SyncService],
})
export class BenefitModule {}
