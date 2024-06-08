import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { ManagedWebhooksService } from './managed-webhooks.service';
import { PrismaService } from '@@core/prisma/prisma.service';
import { LoggerService } from '@@core/logger/logger.service';
import { ManagedWebhooksProcessor } from './handler/managed-webhooks.processor';
import { ManagedWebhooksController } from './managed-webhooks.controller';
import { ValidateUserService } from '@@core/utils/services/validateUser.service';
import { MWHandlerController } from './handler/mw-handler.controller';
import { TicketingWebhookHandlerService } from '@ticketing/@webhook/handler.service';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'webhookDelivery',
    }),
  ],
  controllers: [ManagedWebhooksController, MWHandlerController],
  exports: [
    BullModule.registerQueue({
      name: 'webhookDelivery',
    }),
  ],
  providers: [
    ManagedWebhooksService,
    PrismaService,
    LoggerService,
    ManagedWebhooksProcessor,
    ValidateUserService,
    TicketingWebhookHandlerService,
  ],
})
export class ManagedWebhooksModule {}
