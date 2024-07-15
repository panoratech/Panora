import { EnvironmentService } from '@@core/@core-services/environment/environment.service';
import { IngestDataService } from '@@core/@core-services/unification/ingest-data.service';
import { Module } from '@nestjs/common';
import { AccountModule } from '@ticketing/account/account.module';
import { ContactModule } from '@ticketing/contact/contact.module';
import { TicketModule } from '@ticketing/ticket/ticket.module';
import { UserModule } from '@ticketing/user/user.module';
import { TicketingWebhookHandlerService } from './handler.service';
import { ZendeskHandlerService } from './zendesk/handler';
import { BullQueueModule } from '@@core/@core-services/queues/queue.module';
import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';

@Module({
  imports: [
    TicketModule,
    UserModule,
    AccountModule,
    ContactModule,
    BullQueueModule,
  ],
  providers: [
    EnvironmentService,
    TicketingWebhookHandlerService,
    IngestDataService,
    WebhookService,
    /* PROVIDERS SERVICES */
    ZendeskHandlerService,
  ],
  exports: [ZendeskHandlerService, TicketingWebhookHandlerService],
})
export class TicketingWebhookHandlerModule {}
