import { SyncModule } from '@@core/sync/sync.module';
import { ValidateUserService } from '@@core/utils/services/validate-user.service';
import { Module } from '@nestjs/common';
import { OAuthTokenRefreshService } from './@token-refresh/refresh.service';
import { AccountingConnectionModule } from './accounting/accounting.connection.module';
import { AtsConnectionModule } from './ats/ats.connection.module';
import { ConnectionsController } from './connections.controller';
import { CrmConnectionModule } from './crm/crm.connection.module';
import { FilestorageConnectionModule } from './filestorage/filestorage.connection.module';
import { HrisConnectionModule } from './hris/hris.connection.module';
import { ManagementConnectionsModule } from './management/management.connection.module';
import { MarketingAutomationConnectionsModule } from './marketingautomation/marketingautomation.connection.module';
import { TicketingConnectionModule } from './ticketing/ticketing.connection.module';

@Module({
  controllers: [ConnectionsController],
  imports: [
    CrmConnectionModule,
    ManagementConnectionsModule,
    TicketingConnectionModule,
    AccountingConnectionModule,
    AtsConnectionModule,
    MarketingAutomationConnectionsModule,
    FilestorageConnectionModule,
    HrisConnectionModule,
    SyncModule,
  ],
  providers: [ValidateUserService, OAuthTokenRefreshService],
  exports: [
    ValidateUserService,
    OAuthTokenRefreshService,
    CrmConnectionModule,
    TicketingConnectionModule,
    AccountingConnectionModule,
    AtsConnectionModule,
    MarketingAutomationConnectionsModule,
    FilestorageConnectionModule,
    HrisConnectionModule,
    ManagementConnectionsModule,
  ],
})
export class ConnectionsModule {}
