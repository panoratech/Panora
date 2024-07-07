import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { BullQueueModule } from '@@core/@core-services/queues/queue.module';
import { ValidateUserService } from '@@core/utils/services/validate-user.service';
import { CrmWebhookHandlerModule } from '@crm/@webhook/handler.module';
import { Module } from '@nestjs/common';
import { TicketingWebhookHandlerModule } from '@ticketing/@webhook/handler.module';
import { MWHandlerController } from './handler/mw-handler.controller';
import { ManagedWebhooksController } from './managed-webhooks.controller';
import { ManagedWebhooksService } from './managed-webhooks.service';

@Module({
  imports: [
    BullQueueModule,
    TicketingWebhookHandlerModule,
    CrmWebhookHandlerModule,
  ],
  controllers: [ManagedWebhooksController, MWHandlerController],
  exports: [ManagedWebhooksService],
  providers: [ManagedWebhooksService, LoggerService, ValidateUserService],
})
export class ManagedWebhooksModule {}