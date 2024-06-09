import { LoggerService } from '@@core/logger/logger.service';
import { PrismaService } from '@@core/prisma/prisma.service';
import { Module } from '@nestjs/common';
import { TicketingWebhookHandlerService } from './handler.service';
import { ZendeskHandlerService } from './zendesk/handler';
import { EnvironmentService } from '@@core/environment/environment.service';
import { EncryptionService } from '@@core/encryption/encryption.service';

@Module({
  imports: [
    /*BullModule.registerQueue(
      {
        name: 'webhookDelivery',
      },
      { name: 'syncTasks' },
    ),*/
  ],
  providers: [
    PrismaService,
    LoggerService,
    EncryptionService,
    EnvironmentService,
    TicketingWebhookHandlerService,
    /* PROVIDERS SERVICES */
    ZendeskHandlerService,
  ],
  exports: [
    LoggerService,
    PrismaService,
    ZendeskHandlerService,
    TicketingWebhookHandlerService,
  ],
})
export class TicketingWebhookHandlerModule {}
