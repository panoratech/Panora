import { EncryptionService } from '@@core/@core-services/encryption/encryption.service';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
import { ConnectionUtils } from '@@core/connections/@utils';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { Module } from '@nestjs/common';
import { CandidateController } from './candidate.controller';
import { CandidateService } from './services/candidate.service';
import { ServiceRegistry } from './services/registry.service';
import { SyncService } from './sync/sync.service';
import { IngestDataService } from '@@core/@core-services/unification/ingest-data.service';
import { AshbyService } from './services/ashby';

import { BullQueueModule } from '@@core/@core-services/queues/queue.module';

import { CoreUnification } from '@@core/@core-services/unification/core-unification.service';
import { Utils } from '@ats/@lib/@utils';
import { ServiceRegistry as ApplicationServiceRegistry } from '@ats/application/services/registry.service';
import { ServiceRegistry as AttachmentServiceRegistry } from '@ats/attachment/services/registry.service';
import { AshbyCandidateMapper } from './services/ashby/mappers';
@Module({
  imports: [BullQueueModule],
  controllers: [CandidateController],
  providers: [
    CandidateService,

    CoreUnification,

    SyncService,
    WebhookService,

    ServiceRegistry,

    IngestDataService,

    ApplicationServiceRegistry,
    AttachmentServiceRegistry,
    Utils,
    /* PROVIDERS SERVICES */
    AshbyCandidateMapper,
    AshbyService,
  ],
  exports: [SyncService],
})
export class CandidateModule {}
