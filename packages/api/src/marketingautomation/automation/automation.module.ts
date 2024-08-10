import { EncryptionService } from '@@core/@core-services/encryption/encryption.service';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
import { ConnectionUtils } from '@@core/connections/@utils';
import { CoreModule } from '@@core/core.module';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { Module } from '@nestjs/common';
import { AutomationController } from './automation.controller';
import { AutomationService } from './services/automation.service';
import { ServiceRegistry } from './services/registry.service';
import { SyncService } from './sync/sync.service';
import { IngestDataService } from '@@core/@core-services/unification/ingest-data.service';
import { BullQueueModule } from '@@core/@core-services/queues/queue.module';

import { CoreUnification } from '@@core/@core-services/unification/core-unification.service';

@Module({
  controllers: [AutomationController],
  providers: [
    AutomationService,

    SyncService,
    WebhookService,

    ServiceRegistry,

    IngestDataService,

    CoreUnification,

    /* PROVIDERS SERVICES */
  ],
  exports: [SyncService],
})
export class AutomationModule {}
