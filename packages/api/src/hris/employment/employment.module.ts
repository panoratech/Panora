import { Module } from '@nestjs/common';
import { EmploymentController } from './employment.controller';
import { EmploymentService } from './services/employment.service';
import { ServiceRegistry } from './services/registry.service';
import { SyncService } from './sync/sync.service';
import { IngestDataService } from '@@core/@core-services/unification/ingest-data.service';
import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
import { CoreUnification } from '@@core/@core-services/unification/core-unification.service';
import { GustoEmploymentMapper } from './services/gusto/mappers';
import { Utils } from '@hris/@lib/@utils';
import { DeelEmploymentMapper } from './services/deel/mappers';
@Module({
  controllers: [EmploymentController],
  providers: [
    EmploymentService,
    CoreUnification,
    SyncService,
    WebhookService,
    ServiceRegistry,
    IngestDataService,
    Utils,
    GustoEmploymentMapper,
    DeelEmploymentMapper,
    /* PROVIDERS SERVICES */
  ],
  exports: [SyncService],
})
export class EmploymentModule {}
