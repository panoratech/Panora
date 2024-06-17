import { Module } from '@nestjs/common';
import { CoreSyncService } from './sync.service';
import { SyncController } from './sync.controller';
import { LoggerService } from '../logger/logger.service';
import { PrismaService } from '../prisma/prisma.service';
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
  providers: [CoreSyncService, LoggerService],
  controllers: [SyncController],
})
export class SyncModule {}
