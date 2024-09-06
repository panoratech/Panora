import { EnvironmentService } from '@@core/@core-services/environment/environment.service';
import { BullQueueModule } from '@@core/@core-services/queues/queue.module';
import { WebhookModule } from '@@core/@core-services/webhooks/panora-webhooks/webhook.module';
import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
import { ConnectionsStrategiesService } from '@@core/connections-strategies/connections-strategies.service';
import { Module } from '@nestjs/common';
import { AccountingConnectionsService } from './services/accounting.connection.service';
import { FreeagentConnectionService } from './services/freeagent/freeagent.service';
import { FreshbooksConnectionService } from './services/freshbooks/freshbooks.service';
import { MoneybirdConnectionService } from './services/moneybird/moneybird.service';
import { PennylaneConnectionService } from './services/pennylane/pennylane.service';
import { QuickbooksConnectionService } from './services/quickbooks/quickbooks.service';
import { ServiceRegistry } from './services/registry.service';
import { SageConnectionService } from './services/sage/sage.service';
import { WaveFinancialConnectionService } from './services/wave_financial/wave_financial.service';
import { XeroConnectionService } from './services/xero/xero.service';

@Module({
  imports: [WebhookModule, BullQueueModule],
  providers: [
    AccountingConnectionsService,
    WebhookService,
    EnvironmentService,
    ServiceRegistry,
    ConnectionsStrategiesService,
    //PROVIDERS SERVICES,
    PennylaneConnectionService,
    FreeagentConnectionService,
    FreshbooksConnectionService,
    MoneybirdConnectionService,
    QuickbooksConnectionService,
    SageConnectionService,
    WaveFinancialConnectionService,
    XeroConnectionService,
  ],
  exports: [AccountingConnectionsService],
})
export class AccountingConnectionModule {}
