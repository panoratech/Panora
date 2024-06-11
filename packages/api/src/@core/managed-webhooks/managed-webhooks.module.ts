import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { ManagedWebhooksService } from './managed-webhooks.service';
import { PrismaService } from '@@core/prisma/prisma.service';
import { LoggerService } from '@@core/logger/logger.service';
import { ManagedWebhooksController } from './managed-webhooks.controller';
import { ValidateUserService } from '@@core/utils/services/validateUser.service';
import { MWHandlerController } from './handler/mw-handler.controller';
import { TicketingWebhookHandlerModule } from '@ticketing/@webhook/handler.module';
import { CrmWebhookHandlerModule } from '@crm/@webhook/handler.module';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'realTimeWebhookQueue',
    }),
    TicketingWebhookHandlerModule,
    CrmWebhookHandlerModule,
  ],
  controllers: [ManagedWebhooksController, MWHandlerController],
  exports: [
    BullModule.registerQueue({
      name: 'realTimeWebhookQueue',
    }),
    ManagedWebhooksService,
  ],
  providers: [
    ManagedWebhooksService,
    PrismaService,
    LoggerService,
    ValidateUserService,
  ],
})
export class ManagedWebhooksModule {}
