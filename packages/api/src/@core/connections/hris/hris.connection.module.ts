import { EncryptionService } from '@@core/@core-services/encryption/encryption.service';
import { EnvironmentService } from '@@core/@core-services/environment/environment.service';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { WebhookModule } from '@@core/@core-services/webhooks/panora-webhooks/webhook.module';
import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
import { ConnectionsStrategiesService } from '@@core/connections-strategies/connections-strategies.service';
import { Module } from '@nestjs/common';
import { ConnectionUtils } from '../@utils';
import { BamboohrConnectionService } from './services/bamboohr/bamboohr.service';
import { DeelConnectionService } from './services/deel/deel.service';
import { FactorialConnectionService } from './services/factorial/factorial.service';
import { GustoConnectionService } from './services/gusto/gusto.service';
import { HrisConnectionsService } from './services/hris.connection.service';
import { NamelyConnectionService } from './services/namely/namely.service';
import { PayfitConnectionService } from './services/payfit/payfit.service';
import { ServiceRegistry } from './services/registry.service';
import { RipplingConnectionService } from './services/rippling/rippling.service';
import { CategoryConnectionRegistry } from '@@core/@core-services/registries/connections-categories.registry';
import { BullQueueModule } from '@@core/@core-services/queues/queue.module';

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
  ],
  exports: [HrisConnectionsService],
})
export class HrisConnectionModule {}
