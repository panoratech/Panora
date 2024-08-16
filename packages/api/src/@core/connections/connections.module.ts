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
import { ProductivityConnectionsModule } from './productivity/productivity.connection.module';
import { MarketingAutomationConnectionsModule } from './marketingautomation/marketingautomation.connection.module';
import { TicketingConnectionModule } from './ticketing/ticketing.connection.module';
import { EcommerceConnectionModule } from './ecommerce/ecommerce.connection.module';
import { CybersecurityConnectionsModule } from './cybersecurity/cybersecurity.connection.module';

@Module({
  controllers: [ConnectionsController],
  imports: [
    CrmConnectionModule,
    ProductivityConnectionsModule,
    TicketingConnectionModule,
    AccountingConnectionModule,
    AtsConnectionModule,
    MarketingAutomationConnectionsModule,
    FilestorageConnectionModule,
    HrisConnectionModule,
    EcommerceConnectionModule,
    CybersecurityConnectionsModule,
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
    EcommerceConnectionModule,
    HrisConnectionModule,
    ProductivityConnectionsModule,
    CybersecurityConnectionsModule,
  ],
})
export class ConnectionsModule {}
