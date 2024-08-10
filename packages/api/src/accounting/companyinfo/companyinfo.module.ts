import { EncryptionService } from '@@core/@core-services/encryption/encryption.service';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
import { ConnectionUtils } from '@@core/connections/@utils';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { Module } from '@nestjs/common';
import { CompanyInfoController } from './companyinfo.controller';
import { CompanyInfoService } from './services/companyinfo.service';
import { ServiceRegistry } from './services/registry.service';
import { SyncService } from './sync/sync.service';
import { IngestDataService } from '@@core/@core-services/unification/ingest-data.service';
import { BullQueueModule } from '@@core/@core-services/queues/queue.module';

import { CoreUnification } from '@@core/@core-services/unification/core-unification.service';

@Module({
  controllers: [CompanyInfoController],
  providers: [
    CoreUnification,

    CompanyInfoService,

    SyncService,
    WebhookService,

    FieldMappingService,
    ServiceRegistry,

    IngestDataService,
    /* PROVIDERS SERVICES */
  ],
  exports: [SyncService],
})
export class CompanyInfoModule {}
