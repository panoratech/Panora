import { Module } from '@nestjs/common';
import { ServiceRegistry } from './services/registry.service';
import { TimeoffService } from './services/timeoff.service';
import { SyncService } from './sync/sync.service';
import { TimeoffController } from './timeoff.controller';
import { IngestDataService } from '@@core/@core-services/unification/ingest-data.service';
import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
import { CoreUnification } from '@@core/@core-services/unification/core-unification.service';
import { Utils } from '@hris/@lib/@utils';
import { SageTimeoffMapper } from './services/sage/mappers';
import { SageService } from './services/sage';
@Module({
  controllers: [TimeoffController],
  providers: [
    TimeoffService,
    CoreUnification,
    Utils,
    SyncService,
    WebhookService,
    ServiceRegistry,
    IngestDataService,
    SageTimeoffMapper,
    /* PROVIDERS SERVICES */
    SageService,
  ],
  exports: [SyncService],
})
export class TimeoffModule {}
