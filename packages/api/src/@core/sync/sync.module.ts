import { Module } from '@nestjs/common';
import { CoreSyncService } from './sync.service';
import { SyncController } from './sync.controller';
import { LoggerService } from '../logger/logger.service';
import { PrismaService } from '../prisma/prisma.service';
import { SyncService as CrmCompanySyncService } from '@crm/company/sync/sync.service';
import { SyncService as CrmContactSyncService } from '@crm/contact/sync/sync.service';
import { SyncService as CrmDealSyncService } from '@crm/deal/sync/sync.service';
import { SyncService as CrmEngagementSyncService } from '@crm/engagement/sync/sync.service';
import { SyncService as CrmNoteSyncService } from '@crm/note/sync/sync.service';
import { SyncService as CrmStageSyncService } from '@crm/stage/sync/sync.service';
import { SyncService as CrmTaskSyncService } from '@crm/task/sync/sync.service';
import { SyncService as CrmUserSyncService } from '@crm/user/sync/sync.service';
import { SyncService as TicketingAccountSyncService } from '@ticketing/account/sync/sync.service';
import { SyncService as TicketingCollectionSyncService } from '@ticketing/collection/sync/sync.service';
import { SyncService as TicketingCommentSyncService } from '@ticketing/comment/sync/sync.service';
import { SyncService as TicketingContactSyncService } from '@ticketing/contact/sync/sync.service';
import { SyncService as TicketingTagSyncService } from '@ticketing/tag/sync/sync.service';
import { SyncService as TicketingTeamSyncService } from '@ticketing/team/sync/sync.service';
import { SyncService as TicketingTicketSyncService } from '@ticketing/ticket/sync/sync.service';
import { SyncService as TicketingUserSyncService } from '@ticketing/user/sync/sync.service';
import { BullModule } from '@nestjs/bull';
import { CompanyModule } from '@crm/company/company.module';
import { ContactModule } from '@crm/contact/contact.module';
import { DealModule } from '@crm/deal/deal.module';
import { EngagementModule } from '@crm/engagement/engagement.module';
import { NoteModule } from '@crm/note/note.module';
import { StageModule } from '@crm/stage/stage.module';
import { TaskModule } from '@crm/task/task.module';
import { UserModule } from '@crm/user/user.module';
import { AccountModule } from '@ticketing/account/account.module';
import { CollectionModule } from '@ticketing/collection/collection.module';
import { CommentModule } from '@ticketing/comment/comment.module';
import { ContactModule as TContactModule } from '@ticketing/contact/contact.module';
import { TagModule } from '@ticketing/tag/tag.module';
import { TeamModule } from '@ticketing/team/team.module';
import { TicketModule } from '@ticketing/ticket/ticket.module';
import { UserModule as TUserModule } from '@ticketing/user/user.module';

@Module({
  imports: [
    BullModule.registerQueue(
      { name: 'webhookDelivery' },
      { name: 'syncTasks' },
    ),
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
    CoreSyncService,
    LoggerService,
    PrismaService,
    CrmCompanySyncService,
    CrmContactSyncService,
    CrmDealSyncService,
    CrmEngagementSyncService,
    CrmNoteSyncService,
    CrmStageSyncService,
    CrmTaskSyncService,
    CrmUserSyncService,
    TicketingAccountSyncService,
    TicketingCollectionSyncService,
    TicketingCommentSyncService,
    TicketingContactSyncService,
    TicketingTagSyncService,
    TicketingTeamSyncService,
    TicketingTicketSyncService,
    TicketingUserSyncService,
  ],
  controllers: [SyncController],
})
export class SyncModule {}
