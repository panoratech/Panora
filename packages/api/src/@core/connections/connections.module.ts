import { Module } from '@nestjs/common';
import { CrmConnectionModule } from './crm/crm.connection.module';
import { ConnectionsController } from './connections.controller';
import { LoggerService } from '@@core/logger/logger.service';
import { PrismaService } from '@@core/prisma/prisma.service';
import { TicketingConnectionModule } from './ticketing/ticketing.connection.module';
import { AccountingConnectionModule } from './accounting/accounting.connection.module';
import { MarketingAutomationConnectionsModule } from './marketingautomation/marketingautomation.connection.module';

@Module({
  controllers: [ConnectionsController],
  imports: [
    CrmConnectionModule,
    TicketingConnectionModule,
    AccountingConnectionModule,
    MarketingAutomationConnectionsModule,
  ],
  providers: [LoggerService, PrismaService],
  exports: [
    CrmConnectionModule,
    TicketingConnectionModule,
    AccountingConnectionModule,
    MarketingAutomationConnectionsModule,
  ],
})
export class ConnectionsModule {}
