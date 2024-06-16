import { Module } from '@nestjs/common';
import { PrismaService } from '@@core/prisma/prisma.service';
import { LoggerService } from '@@core/logger/logger.service';
import { WebhookService } from '@@core/webhook/webhook.service';
import { WebhookModule } from '@@core/webhook/webhook.module';
import { EnvironmentService } from '@@core/environment/environment.service';
import { EncryptionService } from '@@core/encryption/encryption.service';
import { ConnectionsStrategiesService } from '@@core/connections-strategies/connections-strategies.service';
import { ServiceRegistry } from './services/registry.service';
import { AccountingConnectionsService } from './services/accounting.connection.service';
import { PennylaneConnectionService } from './services/pennylane/pennylane.service';
import { FreeagentConnectionService } from './services/freeagent/freeagent.service';
import { FreshbooksConnectionService } from './services/freshbooks/freshbooks.service';
import { MoneybirdConnectionService } from './services/moneybird/moneybird.service';
import { QuickbooksConnectionService } from './services/quickbooks/quickbooks.service';
import { SageConnectionService } from './services/sage/sage.service';
import { WaveFinancialConnectionService } from './services/wave_financial/wave_financial.service';
import { XeroConnectionService } from './services/xero/xero.service';

@Module({
  imports: [WebhookModule],
  providers: [
    AccountingConnectionsService,
    PrismaService,
    LoggerService,
    WebhookService,
    EnvironmentService,
    EncryptionService,
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
