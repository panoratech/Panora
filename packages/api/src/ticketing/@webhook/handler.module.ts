import { EncryptionService } from '@@core/@core-services/encryption/encryption.service';
import { EnvironmentService } from '@@core/@core-services/environment/environment.service';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { Module } from '@nestjs/common';
import { AccountModule } from '@ticketing/account/account.module';
import { ContactModule } from '@ticketing/contact/contact.module';
import { TicketModule } from '@ticketing/ticket/ticket.module';
import { UserModule } from '@ticketing/user/user.module';
import { TicketingWebhookHandlerService } from './handler.service';
import { ZendeskHandlerService } from './zendesk/handler';
import { IngestDataService } from '@@core/@core-services/unification/ingest-data.service';
import { CoreSyncRegistry } from '@@core/@core-services/registries/core-sync.registry';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
import { ConnectionUtils } from '@@core/connections/@utils';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { BullQueueModule } from '@@core/@core-services/queues/queue.module';
import { UnificationRegistry } from '@@core/@core-services/registries/unification.registry';
import { MappersRegistry } from '@@core/@core-services/registries/mappers.registry';
import { CoreUnification } from '@@core/@core-services/unification/core-unification.service';

@Module({
  imports: [
    TicketModule,
    UserModule,
    AccountModule,
    ContactModule,
    BullQueueModule,
  ],
  providers: [
    LoggerService,
    EncryptionService,
    EnvironmentService,
    TicketingWebhookHandlerService,
    IngestDataService,
    CoreSyncRegistry,
    CoreUnification,
    MappersRegistry,
    
    WebhookService,
    ConnectionUtils,
    FieldMappingService,
    UnificationRegistry,
    /* PROVIDERS SERVICES */
    ZendeskHandlerService,
  ],
  exports: [
    LoggerService,
    ZendeskHandlerService,
    TicketingWebhookHandlerService,
  ],
})
export class TicketingWebhookHandlerModule {}
