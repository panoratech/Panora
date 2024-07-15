import { EnvironmentService } from '@@core/@core-services/environment/environment.service';
import { BullQueueModule } from '@@core/@core-services/queues/queue.module';
import { WebhookModule } from '@@core/@core-services/webhooks/panora-webhooks/webhook.module';
import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
import { ConnectionsStrategiesService } from '@@core/connections-strategies/connections-strategies.service';
import { Module } from '@nestjs/common';
import { AshbyConnectionService } from './services/ashby/ashby.service';
import { AtsConnectionsService } from './services/ats.connection.service';
import { BamboohrConnectionService } from './services/bamboohr/bamboohr.service';
import { GreenhouseConnectionService } from './services/greenhouse/greenhouse.service';
import { JobadderConnectionService } from './services/jobadder/jobadder.service';
import { LeverConnectionService } from './services/lever/lever.service';
import { ServiceRegistry } from './services/registry.service';
import { WorkdayConnectionService } from './services/workday/workday.service';

@Module({
  imports: [WebhookModule, BullQueueModule],
  providers: [
    AtsConnectionsService,
    WebhookService,
    EnvironmentService,
    ServiceRegistry,
    ConnectionsStrategiesService,
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
