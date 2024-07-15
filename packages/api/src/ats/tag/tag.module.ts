import { EncryptionService } from '@@core/@core-services/encryption/encryption.service';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
import { ConnectionUtils } from '@@core/connections/@utils';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { Module } from '@nestjs/common';
import { ServiceRegistry } from './services/registry.service';
import { TagService } from './services/tag.service';
import { SyncService } from './sync/sync.service';
import { TagController } from './tag.controller';
import { IngestDataService } from '@@core/@core-services/unification/ingest-data.service';
import { AshbyService } from './services/ashby';

import { BullQueueModule } from '@@core/@core-services/queues/queue.module';

import { CoreUnification } from '@@core/@core-services/unification/core-unification.service';
import { AshbyTagMapper } from './services/ashby/mappers';
import { Utils } from '@ats/@lib/@utils';

@Module({
  imports: [BullQueueModule],
  controllers: [TagController],
  providers: [
    TagService,

    SyncService,
    WebhookService,

    Utils,
    ServiceRegistry,
    CoreUnification,

    IngestDataService,

    AshbyTagMapper,
    /* PROVIDERS SERVICES */
    AshbyService,
  ],
  exports: [SyncService],
})
export class TagModule {}
