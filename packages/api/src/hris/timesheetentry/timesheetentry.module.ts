import { Module } from '@nestjs/common';
import { TimesheetentryController } from './timesheetentry.controller';
import { ServiceRegistry } from './services/registry.service';
import { TimesheetentryService } from './services/timesheetentry.service';
import { SyncService } from './sync/sync.service';
import { IngestDataService } from '@@core/@core-services/unification/ingest-data.service';
import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';

import { CoreUnification } from '@@core/@core-services/unification/core-unification.service';

@Module({
  controllers: [TimesheetentryController],
  providers: [
    TimesheetentryService,
    CoreUnification,
    SyncService,
    WebhookService,
    ServiceRegistry,
    IngestDataService,
    /* PROVIDERS SERVICES */
  ],
  exports: [SyncService],
})
export class TimesheetentryModule {}
