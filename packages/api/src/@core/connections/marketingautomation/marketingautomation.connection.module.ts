import { Module } from '@nestjs/common';
import { PrismaService } from '@@core/prisma/prisma.service';
import { LoggerService } from '@@core/logger/logger.service';
import { WebhookService } from '@@core/webhook/webhook.service';
import { WebhookModule } from '@@core/webhook/webhook.module';
import { EnvironmentService } from '@@core/environment/environment.service';
import { EncryptionService } from '@@core/encryption/encryption.service';
import { ConnectionsStrategiesService } from '@@core/connections-strategies/connections-strategies.service';
import { MarketingAutomationConnectionsService } from './services/marketingautomation.connection.service';
import { ServiceRegistry } from './services/registry.service';
import { ConnectionUtils } from '../@utils';

@Module({
  imports: [WebhookModule],
  providers: [
    MarketingAutomationConnectionsService,
    PrismaService,
    LoggerService,
    WebhookService,
    EnvironmentService,
    EncryptionService,
    ServiceRegistry,
    ConnectionsStrategiesService,
    ConnectionUtils,
    //PROVIDERS SERVICES
  ],
  exports: [MarketingAutomationConnectionsService],
})
export class MarketingAutomationConnectionsModule {}
