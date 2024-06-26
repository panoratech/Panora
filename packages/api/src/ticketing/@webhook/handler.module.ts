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

@Module({
  imports: [TicketModule, UserModule, AccountModule, ContactModule],
  providers: [
    LoggerService,
    EncryptionService,
    EnvironmentService,
    TicketingWebhookHandlerService,
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
