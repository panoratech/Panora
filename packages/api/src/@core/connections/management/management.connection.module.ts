import { EnvironmentService } from '@@core/@core-services/environment/environment.service';
import { BullQueueModule } from '@@core/@core-services/queues/queue.module';
import { WebhookModule } from '@@core/@core-services/webhooks/panora-webhooks/webhook.module';
import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
import { ConnectionsStrategiesService } from '@@core/connections-strategies/connections-strategies.service';
import { Module } from '@nestjs/common';
import { ManagementConnectionsService } from './services/management.connection.service';
import { NotionConnectionService } from './services/notion/notion.service';
import { ServiceRegistry } from './services/registry.service';
import { SlackConnectionService } from './services/slack/slack.service';
@Module({
  imports: [WebhookModule, BullQueueModule],
  providers: [
    ManagementConnectionsService,
    WebhookService,
    EnvironmentService,
    ServiceRegistry,
    ConnectionsStrategiesService,
    //PROVIDERS SERVICES
    NotionConnectionService,
    SlackConnectionService,
  ],
  exports: [ManagementConnectionsService],
})
export class ManagementConnectionsModule {}
