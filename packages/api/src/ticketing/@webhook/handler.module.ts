import { LoggerService } from '@@core/logger/logger.service';
import { PrismaService } from '@@core/prisma/prisma.service';
import { Module } from '@nestjs/common';
import { TicketingWebhookHandlerService } from './handler.service';
import { ZendeskHandlerService } from './zendesk/handler';

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
    TicketingWebhookHandlerService,
    /* PROVIDERS SERVICES */
    ZendeskHandlerService,
  ],
  exports: [LoggerService, PrismaService],
})
export class TicketingWebhookHandlerModule {}
