import { EncryptionService } from '@@core/@core-services/encryption/encryption.service';
import { EnvironmentService } from '@@core/@core-services/environment/environment.service';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { Module } from '@nestjs/common';
import { CrmWebhookHandlerService } from './handler.service';
import { IngestDataService } from '@@core/@core-services/unification/ingest-data.service';
import { CoreSyncRegistry } from '@@core/@core-services/registries/core-sync.registry';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { CoreUnification } from '@@core/@core-services/unification/core-unification.service';
import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
import { ConnectionUtils } from '@@core/connections/@utils';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { BullQueueModule } from '@@core/@core-services/queues/queue.module';
import { UnificationRegistry } from '@@core/@core-services/registries/unification.registry';
import { MappersRegistry } from '@@core/@core-services/registries/mappers.registry';

@Module({
  imports: [BullQueueModule],
  providers: [
    LoggerService,
    EncryptionService,
    EnvironmentService,
    CrmWebhookHandlerService,
    IngestDataService,
    UnificationRegistry,
    CoreSyncRegistry,
    WebhookService,
    ConnectionUtils,
    FieldMappingService,
    
    CoreUnification,
    MappersRegistry,
    /* PROVIDERS SERVICES */
  ],
  exports: [LoggerService, CrmWebhookHandlerService],
})
export class CrmWebhookHandlerModule {}
