import { Module } from '@nestjs/common';
import { PrismaService } from '@@core/prisma/prisma.service';
import { ZendeskConnectionService } from './services/zendesk/zendesk.service';
import { LoggerService } from '@@core/logger/logger.service';
import { WebhookService } from '@@core/webhook/webhook.service';
import { WebhookModule } from '@@core/webhook/webhook.module';
import { EnvironmentService } from '@@core/environment/environment.service';
import { EncryptionService } from '@@core/encryption/encryption.service';
import { TicketingConnectionsService } from './services/ticketing.connection.service';
import { ServiceConnectionRegistry } from './services/registry.service';

@Module({
  imports: [WebhookModule],
  providers: [
    TicketingConnectionsService,
    PrismaService,
    ZendeskConnectionService,
    LoggerService,
    WebhookService,
    EnvironmentService,
    EncryptionService,
    ServiceConnectionRegistry,
    ZendeskConnectionService,
  ],
  exports: [TicketingConnectionsService],
})
export class TicketingConnectionModule {}
