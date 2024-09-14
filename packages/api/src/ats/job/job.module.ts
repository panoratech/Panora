import { EncryptionService } from '@@core/@core-services/encryption/encryption.service';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
import { ConnectionUtils } from '@@core/connections/@utils';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { Module } from '@nestjs/common';
import { JobController } from './job.controller';
import { JobService } from './services/job.service';
import { ServiceRegistry } from './services/registry.service';
import { SyncService } from './sync/sync.service';
import { IngestDataService } from '@@core/@core-services/unification/ingest-data.service';
import { AshbyService } from './services/ashby';

import { BullQueueModule } from '@@core/@core-services/queues/queue.module';

import { CoreUnification } from '@@core/@core-services/unification/core-unification.service';
import { AshbyJobMapper } from './services/ashby/mappers';
import { Utils } from '@ats/@lib/@utils';
import { BamboohrService } from './services/bamboohr';
import { BamboohrJobMapper } from './services/bamboohr/mapper';

@Module({
  controllers: [JobController],
  providers: [
    CoreUnification,

    JobService,

    SyncService,
    WebhookService,

    ServiceRegistry,

    IngestDataService,

    AshbyJobMapper,
    Utils,
    /* PROVIDERS SERVICES */
    AshbyService,
    BamboohrService,
    BamboohrJobMapper,
  ],
  exports: [SyncService],
})
export class JobModule {}
