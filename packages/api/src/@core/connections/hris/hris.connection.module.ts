import { EnvironmentService } from '@@core/@core-services/environment/environment.service';
import { BullQueueModule } from '@@core/@core-services/queues/queue.module';
import { WebhookModule } from '@@core/@core-services/webhooks/panora-webhooks/webhook.module';
import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
import { ConnectionsStrategiesService } from '@@core/connections-strategies/connections-strategies.service';
import { Module } from '@nestjs/common';
import { BamboohrConnectionService } from './services/bamboohr/bamboohr.service';
import { DeelConnectionService } from './services/deel/deel.service';
import { FactorialConnectionService } from './services/factorial/factorial.service';
import { GustoConnectionService } from './services/gusto/gusto.service';
import { HrisConnectionsService } from './services/hris.connection.service';
import { NamelyConnectionService } from './services/namely/namely.service';
import { PayfitConnectionService } from './services/payfit/payfit.service';
import { ServiceRegistry } from './services/registry.service';
import { RipplingConnectionService } from './services/rippling/rippling.service';
import { SageConnectionService } from './services/sage/sage.service';

@Module({
  imports: [WebhookModule, BullQueueModule],
  providers: [
    HrisConnectionsService,
    ServiceRegistry,
    WebhookService,
    EnvironmentService,
    ConnectionsStrategiesService,
    // PROVIDERS SERVICES
    RipplingConnectionService,
    DeelConnectionService,
    GustoConnectionService,
    PayfitConnectionService,
    FactorialConnectionService,
    NamelyConnectionService,
    BamboohrConnectionService,
    SageConnectionService,
  ],
  exports: [HrisConnectionsService],
})
export class HrisConnectionModule {}
