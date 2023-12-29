import { Module } from '@nestjs/common';
import { SyncCommentsService } from './sync/sync.service';
import { WebhookService } from '@@core/webhook/webhook.service';
import { EncryptionService } from '@@core/encryption/encryption.service';
import { LoggerService } from '@@core/logger/logger.service';
import { PrismaService } from '@@core/prisma/prisma.service';
import { ZendeskCommentService } from './services/zendesk';
import { BullModule } from '@nestjs/bull';
import { CommentController } from './comment.controller';
import { CommentService } from './services/comment.service';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { CommentServiceRegistry } from './services/registry.service';

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
    ZendeskCommentService,
    SyncCommentsService,
    WebhookService,
    EncryptionService,
    FieldMappingService,
    CommentServiceRegistry,
  ],
  exports: [SyncCommentsService],
})
export class CommentModule {}
