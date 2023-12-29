import { Module } from '@nestjs/common';
import { SyncCommentsService } from './sync/sync.service';
import { WebhookService } from '@@core/webhook/webhook.service';
import { EncryptionService } from '@@core/encryption/encryption.service';
import { LoggerService } from '@@core/logger/logger.service';
import { PrismaService } from '@@core/prisma/prisma.service';
import { ZendeskService } from './services/zendesk';
import { BullModule } from '@nestjs/bull';
import { CommentController } from './comment.controller';
import { CommentService } from './services/comment.service';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'webhookDelivery',
    }),
  ],
  controllers: [CommentController],
  providers: [
    CommentService,
    PrismaService,
    LoggerService,
    ZendeskService,
    SyncCommentsService,
    WebhookService,
    EncryptionService,
  ],
  exports: [SyncCommentsService],
})
export class CommentModule {}
