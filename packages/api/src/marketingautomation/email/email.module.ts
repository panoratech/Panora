import { EncryptionService } from '@@core/@core-services/encryption/encryption.service';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
import { ConnectionUtils } from '@@core/connections/@utils';
import { CoreModule } from '@@core/core.module';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { EmailController } from './email.controller';
import { EmailService } from './services/email.service';
import { ServiceRegistry } from './services/registry.service';
import { SyncService } from './sync/sync.service';
import { IngestDataService } from '@@core/@core-services/unification/ingest-data.service';
import { BullQueueModule } from '@@core/@core-services/queues/queue.module';

import { CoreUnification } from '@@core/@core-services/unification/core-unification.service';

@Module({
  controllers: [EmailController],
  providers: [
    EmailService,

    SyncService,
    WebhookService,

    FieldMappingService,
    ServiceRegistry,
    CoreUnification,

    IngestDataService,
    /* PROVIDERS SERVICES */
  ],
  exports: [SyncService],
})
export class EmailModule {}
