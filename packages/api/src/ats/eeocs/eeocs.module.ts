import { EncryptionService } from '@@core/@core-services/encryption/encryption.service';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
import { ConnectionUtils } from '@@core/connections/@utils';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { Module } from '@nestjs/common';
import { EeocsController } from './eeocs.controller';
import { EeocsService } from './services/eeocs.service';
import { ServiceRegistry } from './services/registry.service';
import { SyncService } from './sync/sync.service';
import { IngestDataService } from '@@core/@core-services/unification/ingest-data.service';

import { BullQueueModule } from '@@core/@core-services/queues/queue.module';

import { CoreUnification } from '@@core/@core-services/unification/core-unification.service';
import { Utils } from '@ats/@lib/@utils';

@Module({
  imports: [BullQueueModule],
  controllers: [EeocsController],
  providers: [
    EeocsService,

    SyncService,
    WebhookService,
    CoreUnification,

    ServiceRegistry,

    IngestDataService,

    Utils,
    /* PROVIDERS SERVICES */
  ],
  exports: [SyncService],
})
export class EeocsModule {}
