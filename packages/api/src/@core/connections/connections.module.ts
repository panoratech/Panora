import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { CoreSyncService } from '@@core/sync/sync.service';
import { ValidateUserService } from '@@core/utils/services/validate-user.service';
import { CompanyModule } from '@crm/company/company.module';
import { ContactModule } from '@crm/contact/contact.module';
import { DealModule } from '@crm/deal/deal.module';
import { EngagementModule } from '@crm/engagement/engagement.module';
import { NoteModule } from '@crm/note/note.module';
import { StageModule } from '@crm/stage/stage.module';
import { TaskModule } from '@crm/task/task.module';
import { UserModule } from '@crm/user/user.module';
import { Module } from '@nestjs/common';
import { AccountModule } from '@ticketing/account/account.module';
import { CollectionModule } from '@ticketing/collection/collection.module';
import { CommentModule } from '@ticketing/comment/comment.module';
import { ContactModule as TContactModule } from '@ticketing/contact/contact.module';
import { TagModule } from '@ticketing/tag/tag.module';
import { TeamModule } from '@ticketing/team/team.module';
import { TicketModule } from '@ticketing/ticket/ticket.module';
import { UserModule as TUserModule } from '@ticketing/user/user.module';
import { ConnectionUtils } from './@utils';
import { AccountingConnectionModule } from './accounting/accounting.connection.module';
import { AtsConnectionModule } from './ats/ats.connection.module';
import { ConnectionsController } from './connections.controller';
import { CrmConnectionModule } from './crm/crm.connection.module';
import { FilestorageConnectionModule } from './filestorage/filestorage.connection.module';
import { HrisConnectionModule } from './hris/hris.connection.module';
import { ManagementConnectionsModule } from './management/management.connection.module';
import { MarketingAutomationConnectionsModule } from './marketingautomation/marketingautomation.connection.module';
import { TicketingConnectionModule } from './ticketing/ticketing.connection.module';
import { OAuthTokenRefreshService } from './@token-refresh/refresh.service';

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
    CompanyModule,
    ContactModule,
    DealModule,
    EngagementModule,
    NoteModule,
    StageModule,
    TaskModule,
    UserModule,
    AccountModule,
    CollectionModule,
    CommentModule,
    TContactModule,
    TagModule,
    TeamModule,
    TicketModule,
    TUserModule,
  ],
  providers: [
    LoggerService,
    ValidateUserService,
    CoreSyncService,
    ConnectionUtils,
    OAuthTokenRefreshService,
  ],
  exports: [
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
