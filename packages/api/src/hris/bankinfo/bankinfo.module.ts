import { Module } from '@nestjs/common';
import { BankinfoController } from './bankinfo.controller';
import { SyncService } from './sync/sync.service';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { BankInfoService } from './services/bankinfo.service';
import { ServiceRegistry } from './services/registry.service';
import { EncryptionService } from '@@core/@core-services/encryption/encryption.service';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';

import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
import { BullModule } from '@nestjs/bull';
import { ConnectionUtils } from '@@core/connections/@utils';
import { ApiKeyAuthGuard } from '@@core/auth/guards/api-key.guard';
import { IngestDataService } from '@@core/@core-services/unification/ingest-data.service';
import { BullQueueModule } from '@@core/@core-services/queues/queue.module';

import { CoreUnification } from '@@core/@core-services/unification/core-unification.service';

@Module({
  imports: [BullQueueModule],
  controllers: [BankinfoController],
  providers: [
    BankInfoService,

    SyncService,
    WebhookService,

    ServiceRegistry,

    IngestDataService,
    CoreUnification,

    /* PROVIDERS SERVICES */
  ],
  exports: [SyncService],
})
export class BankInfoModule {}
