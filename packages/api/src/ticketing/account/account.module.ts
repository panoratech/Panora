import { EncryptionService } from '@@core/@core-services/encryption/encryption.service';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { BullQueueModule } from '@@core/@core-services/queues/queue.module';

import { CoreUnification } from '@@core/@core-services/unification/core-unification.service';
import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
import { ConnectionUtils } from '@@core/connections/@utils';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { Module } from '@nestjs/common';
import { Utils } from '@ticketing/@lib/@utils';
import { AccountController } from './account.controller';
import { AccountService } from './services/account.service';
import { FrontService } from './services/front';
import { FrontAccountMapper } from './services/front/mappers';
import { ServiceRegistry } from './services/registry.service';
import { ZendeskService } from './services/zendesk';
import { ZendeskAccountMapper } from './services/zendesk/mappers';
import { SyncService } from './sync/sync.service';
import { IngestDataService } from '@@core/@core-services/unification/ingest-data.service';
@Module({
  controllers: [AccountController],
  providers: [
    AccountService,

    SyncService,
    WebhookService,

    ServiceRegistry,

    CoreUnification,
    IngestDataService,
    Utils,
    /* PROVIDERS SERVICES */
    ZendeskService,
    FrontService,
    /* PROVIDERS MAPPERS */
    ZendeskAccountMapper,
    FrontAccountMapper,
  ],
  exports: [SyncService, ServiceRegistry, WebhookService],
})
export class AccountModule {}
