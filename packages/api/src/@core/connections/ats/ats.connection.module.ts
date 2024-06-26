import { EncryptionService } from '@@core/@core-services/encryption/encryption.service';
import { EnvironmentService } from '@@core/@core-services/environment/environment.service';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
import { ConnectionsStrategiesService } from '@@core/connections-strategies/connections-strategies.service';
import { Module } from '@nestjs/common';
import { ConnectionUtils } from '../@utils';
import { AshbyConnectionService } from './services/ashby/ashby.service';
import { AtsConnectionsService } from './services/ats.connection.service';
import { BamboohrConnectionService } from './services/bamboohr/bamboohr.service';
import { GreenhouseConnectionService } from './services/greenhouse/greenhouse.service';
import { JobadderConnectionService } from './services/jobadder/jobadder.service';
import { LeverConnectionService } from './services/lever/lever.service';
import { ServiceRegistry } from './services/registry.service';
import { WorkdayConnectionService } from './services/workday/workday.service';
import { WebhookModule } from '@@core/@core-services/webhooks/panora-webhooks/webhook.module';

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
