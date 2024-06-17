import { LoggerService } from '@@core/logger/logger.service';
import { PrismaService } from '@@core/prisma/prisma.service';
import { Module } from '@nestjs/common';
import { TicketingWebhookHandlerService } from './handler.service';
import { ZendeskHandlerService } from './zendesk/handler';
import { EnvironmentService } from '@@core/environment/environment.service';
import { EncryptionService } from '@@core/encryption/encryption.service';
import { TicketModule } from '@ticketing/ticket/ticket.module';
import { UserModule } from '@ticketing/user/user.module';
import { AccountModule } from '@ticketing/account/account.module';
import { ContactModule } from '@ticketing/contact/contact.module';

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
