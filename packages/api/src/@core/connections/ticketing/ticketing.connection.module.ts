import { Module } from '@nestjs/common';
import { PrismaService } from '@@core/prisma/prisma.service';
import { ZendeskConnectionService } from './services/zendesk/zendesk.service';
import { LoggerService } from '@@core/logger/logger.service';
import { WebhookService } from '@@core/webhook/webhook.service';
import { WebhookModule } from '@@core/webhook/webhook.module';
import { EnvironmentService } from '@@core/environment/environment.service';
import { EncryptionService } from '@@core/encryption/encryption.service';
import { TicketingConnectionsService } from './services/ticketing.connection.service';
import { ServiceRegistry } from './services/registry.service';
import { FrontConnectionService } from './services/front/front.service';

@Module({
  imports: [WebhookModule],
  providers: [
    TicketingConnectionsService,
    PrismaService,
    LoggerService,
    WebhookService,
    EnvironmentService,
    EncryptionService,
    ServiceRegistry,
    //PROVIDERS SERVICES
    ZendeskConnectionService,
    FrontConnectionService,
  ],
  exports: [TicketingConnectionsService],
})
export class TicketingConnectionModule {}
