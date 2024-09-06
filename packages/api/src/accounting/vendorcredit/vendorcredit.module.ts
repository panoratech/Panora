import { EncryptionService } from '@@core/@core-services/encryption/encryption.service';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
import { ConnectionUtils } from '@@core/connections/@utils';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { Module } from '@nestjs/common';
import { ServiceRegistry } from './services/registry.service';
import { VendorCreditService } from './services/vendorcredit.service';
import { SyncService } from './sync/sync.service';
import { VendorCreditController } from './vendorcredit.controller';
import { IngestDataService } from '@@core/@core-services/unification/ingest-data.service';
import { BullQueueModule } from '@@core/@core-services/queues/queue.module';

import { CoreUnification } from '@@core/@core-services/unification/core-unification.service';

@Module({
  controllers: [VendorCreditController],
  providers: [
    VendorCreditService,

    SyncService,
    WebhookService,
    CoreUnification,

    FieldMappingService,
    ServiceRegistry,

    IngestDataService,
    /* PROVIDERS SERVICES */
  ],
  exports: [SyncService],
})
export class VendorCreditModule {}
