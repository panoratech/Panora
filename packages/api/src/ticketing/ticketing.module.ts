import { Module } from '@nestjs/common';
import { TicketModule } from './ticket/ticket.module';
import { CommentModule } from './comment/comment.module';
import { UserModule } from './user/user.module';
import { AttachmentModule } from './attachment/attachment.module';
import { ContactModule } from './contact/contact.module';

@Module({
  imports: [
    TicketModule,
    CommentModule,
    UserModule,
    AttachmentModule,
    ContactModule,
  ],
  providers: [],
  controllers: [],
  exports: [
    TicketModule,
    CommentModule,
    UserModule,
    AttachmentModule,
    ContactModule,
  ],
})
export class TicketingModule {}
