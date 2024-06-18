import { Module } from '@nestjs/common';
import { LoggerService } from '@@core/logger/logger.service';
import { WebhookService } from '@@core/webhook/webhook.service';
import { WebhookModule } from '@@core/webhook/webhook.module';
import { EnvironmentService } from '@@core/environment/environment.service';
import { EncryptionService } from '@@core/encryption/encryption.service';
import { ConnectionsStrategiesService } from '@@core/connections-strategies/connections-strategies.service';
import { ConnectionUtils } from '../@utils';
import { GreenhouseConnectionService } from './services/greenhouse/greenhouse.service';
import { AtsConnectionsService } from './services/ats.connection.service';
import { ServiceRegistry } from './registry.service';
import { LeverConnectionService } from './services/lever/lever.service';
import { JobadderConnectionService } from './services/jobadder/jobadder.service';

@Module({
  imports: [WebhookModule],
  providers: [
    AtsConnectionsService,
    LoggerService,
    WebhookService,
    EnvironmentService,
    EncryptionService,
    ServiceRegistry,
    ConnectionsStrategiesService,
    ConnectionUtils,
    //PROVIDERS SERVICES,
    GreenhouseConnectionService,
    LeverConnectionService,
    JobadderConnectionService,
  ],
  exports: [AtsConnectionsService],
})
export class AtsConnectionModule {}
