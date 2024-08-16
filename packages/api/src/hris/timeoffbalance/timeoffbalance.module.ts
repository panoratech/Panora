import { Module } from '@nestjs/common';
import { ServiceRegistry } from './services/registry.service';
import { TimeoffBalanceService } from './services/timeoffbalance.service';
import { SyncService } from './sync/sync.service';
import { TimeoffBalanceController } from './timeoffbalance.controller';
import { IngestDataService } from '@@core/@core-services/unification/ingest-data.service';
import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
import { CoreUnification } from '@@core/@core-services/unification/core-unification.service';
import { Utils } from '@hris/@lib/@utils';
import { SageTimeoffbalanceMapper } from './services/sage/mappers';
import { SageService } from './services/sage';
@Module({
  controllers: [TimeoffBalanceController],
  providers: [
    TimeoffBalanceService,
    CoreUnification,
    Utils,
    SyncService,
    WebhookService,
    ServiceRegistry,
    IngestDataService,
    SageTimeoffbalanceMapper,
    /* PROVIDERS SERVICES */
    SageService,
  ],
  exports: [SyncService],
})
export class TimeoffBalanceModule {}
