import { Module } from '@nestjs/common';
import { DependentController } from './dependent.controller';
import { DependentService } from './services/dependent.service';
import { ServiceRegistry } from './services/registry.service';
import { SyncService } from './sync/sync.service';
import { IngestDataService } from '@@core/@core-services/unification/ingest-data.service';
import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
import { CoreUnification } from '@@core/@core-services/unification/core-unification.service';
import { Utils } from '@hris/@lib/@utils';
@Module({
  controllers: [DependentController],
  providers: [
    DependentService,
    Utils,
    CoreUnification,
    SyncService,
    WebhookService,
    ServiceRegistry,
    IngestDataService,
    /* PROVIDERS SERVICES */
  ],
  exports: [SyncService],
})
export class DependentModule {}
