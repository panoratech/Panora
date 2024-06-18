import { Module } from '@nestjs/common';
import { HrisConnectionsService } from './services/hris.connection.service';
import { PrismaService } from '@@core/prisma/prisma.service';
import { LoggerService } from '@@core/logger/logger.service';
import { WebhookService } from '@@core/webhook/webhook.service';
import { WebhookModule } from '@@core/webhook/webhook.module';
import { EnvironmentService } from '@@core/environment/environment.service';
import { EncryptionService } from '@@core/encryption/encryption.service';
import { ServiceRegistry } from './services/registry.service';
import { ConnectionsStrategiesService } from '@@core/connections-strategies/connections-strategies.service';
import { DeelConnectionService } from './services/deel/deel.service';
import { RipplingConnectionService } from './services/rippling/rippling.service';
import { ConnectionUtils } from '../@utils';

@Module({
  imports: [WebhookModule],
  providers: [
    HrisConnectionsService,
    ServiceRegistry,
    LoggerService,
    WebhookService,
    EnvironmentService,
    EncryptionService,
    ConnectionsStrategiesService,
    ConnectionUtils,
    // PROVIDERS SERVICES
    RipplingConnectionService,
    DeelConnectionService,
  ],
  exports: [HrisConnectionsService],
})
export class HrisConnectionModule {}
