import { Module } from '@nestjs/common';
import { TicketModule } from './ticket/ticket.module';
import { CommentModule } from './comment/comment.module';
import { UserModule } from './user/user.module';
import { AttachmentModule } from './attachment/attachment.module';

@Module({
  imports: [TicketModule, CommentModule, UserModule, AttachmentModule],
  providers: [],
  controllers: [],
  exports: [TicketModule, CommentModule, UserModule, AttachmentModule],
})
export class TicketingModule {}
