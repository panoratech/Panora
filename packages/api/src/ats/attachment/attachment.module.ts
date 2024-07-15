import { Module } from '@nestjs/common';
import { AttachmentController } from './attachment.controller';
import { SyncService } from './sync/sync.service';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { AttachmentService } from './services/attachment.service';
import { ServiceRegistry } from './services/registry.service';
import { EncryptionService } from '@@core/@core-services/encryption/encryption.service';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
import { ConnectionUtils } from '@@core/connections/@utils';
import { IngestDataService } from '@@core/@core-services/unification/ingest-data.service';

import { BullQueueModule } from '@@core/@core-services/queues/queue.module';

import { CoreUnification } from '@@core/@core-services/unification/core-unification.service';
import { AshbyAttachmentMapper } from './services/ashby/mappers';
import { Utils } from '@ats/@lib/@utils';

@Module({
  imports: [BullQueueModule],
  controllers: [AttachmentController],
  providers: [
    AttachmentService,

    SyncService,
    WebhookService,
    CoreUnification,

    ServiceRegistry,

    IngestDataService,

    AshbyAttachmentMapper,
    Utils,
    /* PROVIDERS SERVICES */
  ],
  exports: [SyncService],
})
export class AttachmentModule {}
