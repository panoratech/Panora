import { SyncModule } from '@@core/sync/sync.module';
import { ValidateUserService } from '@@core/utils/services/validate-user.service';
import { Module } from '@nestjs/common';
import { OAuthTokenRefreshService } from './@token-refresh/refresh.service';
import { AccountingConnectionModule } from './accounting/accounting.connection.module';
import { ConnectionsController } from './connections.controller';
import { CrmConnectionModule } from './crm/crm.connection.module';
import { FilestorageConnectionModule } from './filestorage/filestorage.connection.module';
import { ProductivityConnectionsModule } from './productivity/productivity.connection.module';
import { MarketingAutomationConnectionsModule } from './marketingautomation/marketingautomation.connection.module';
import { TicketingConnectionModule } from './ticketing/ticketing.connection.module';
import { EcommerceConnectionModule } from './ecommerce/ecommerce.connection.module';

@Module({
  controllers: [ConnectionsController],
  imports: [
    CrmConnectionModule,
    ProductivityConnectionsModule,
    TicketingConnectionModule,
    AccountingConnectionModule,
    MarketingAutomationConnectionsModule,
    FilestorageConnectionModule,
    EcommerceConnectionModule,
    SyncModule,
  ],
  providers: [ValidateUserService, OAuthTokenRefreshService],
  exports: [
    ValidateUserService,
    OAuthTokenRefreshService,
    CrmConnectionModule,
    TicketingConnectionModule,
    AccountingConnectionModule,
    MarketingAutomationConnectionsModule,
    FilestorageConnectionModule,
    EcommerceConnectionModule,
    ProductivityConnectionsModule,
  ],
})
export class ConnectionsModule {}
