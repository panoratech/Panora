import { ValidateUserService } from '@@core/utils/services/validate-user.service';
import { CrmWebhookHandlerModule } from '@crm/@webhook/handler.module';
import { Module } from '@nestjs/common';
import { TicketingWebhookHandlerModule } from '@ticketing/@webhook/handler.module';
import { MWHandlerController } from './handler/mw-handler.controller';
import { ManagedWebhooksController } from './managed-webhooks.controller';
import { ManagedWebhooksService } from './managed-webhooks.service';

@Module({
  imports: [TicketingWebhookHandlerModule, CrmWebhookHandlerModule],
  controllers: [ManagedWebhooksController, MWHandlerController],
  exports: [ManagedWebhooksService],
  providers: [ManagedWebhooksService, ValidateUserService],
})
export class ManagedWebhooksModule {}
