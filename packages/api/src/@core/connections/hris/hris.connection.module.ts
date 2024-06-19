import { Module } from '@nestjs/common';
import { HrisConnectionsService } from './services/hris.connection.service';
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
import { GustoConnectionService } from './services/gusto/gusto.service';
import { PayfitConnectionService } from './services/payfit/payfit.service';
import { FactorialConnectionService } from './services/factorial/factorial.service';
import { NamelyConnectionService } from './services/namely/namely.service';
import { BamboohrConnectionService } from './services/bamboohr/bamboohr.service';

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
    GustoConnectionService,
    PayfitConnectionService,
    FactorialConnectionService,
    NamelyConnectionService,
    BamboohrConnectionService,
  ],
  exports: [HrisConnectionsService],
})
export class HrisConnectionModule {}
