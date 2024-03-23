import { Module } from '@nestjs/common';
import { TicketModule } from './ticket/ticket.module';
import { CommentModule } from './comment/comment.module';
import { UserModule } from './user/user.module';
import { AttachmentModule } from './attachment/attachment.module';
import { ContactModule } from './contact/contact.module';
import { AccountModule } from './account/account.module';
import { TagModule } from './tag/tag.module';
import { TeamModule } from './team/team.module';
import { ProjectModule } from './project/project.module';
import { CollectionModule } from './collection/collection.module';

@Module({
  imports: [
    TicketModule,
    CommentModule,
    UserModule,
    AttachmentModule,
    ContactModule,
    AccountModule,
    TagModule,
    TeamModule,
    ProjectModule,
    CollectionModule,
  ],
  providers: [],
  controllers: [],
  exports: [export class TicketingModule {}
