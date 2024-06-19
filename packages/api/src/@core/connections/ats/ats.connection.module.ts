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
import { LeverConnectionService } from './services/lever/lever.service';
import { JobadderConnectionService } from './services/jobadder/jobadder.service';
import { WorkdayConnectionService } from './services/workday/workday.service';
import { AshbyConnectionService } from './services/ashby/ashby.service';
import { ServiceRegistry } from './services/registry.service';
import { BamboohrConnectionService } from './services/bamboohr/bamboohr.service';

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
    WorkdayConnectionService,
    AshbyConnectionService,
    BamboohrConnectionService,
  ],
  exports: [AtsConnectionsService],
})
export class AtsConnectionModule {}
