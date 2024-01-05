import { Module } from '@nestjs/common';
import { AttachmentController } from './attachment.controller';
import { SyncService } from './sync/sync.service';
import { LoggerService } from '@@core/logger/logger.service';
import { ZendeskService } from './services/zendesk';
import { AttachmentService } from './services/attachment.service';
import { ServiceRegistry } from './services/registry.service';
import { EncryptionService } from '@@core/encryption/encryption.service';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { PrismaService } from '@@core/prisma/prisma.service';
import { WebhookService } from '@@core/webhook/webhook.service';
import { BullModule } from '@nestjs/bull';
import { GithubService } from './services/github';
import { FrontService } from './services/front';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'webhookDelivery',
    }),
  ],
  controllers: [AttachmentController],
  providers: [
    AttachmentService,
    PrismaService,
    LoggerService,
    SyncService,
    WebhookService,
    EncryptionService,
    FieldMappingService,
    ServiceRegistry,
    /* PROVIDERS SERVICES */
    ZendeskService,
    FrontService,
    GithubService,
  ],
  exports: [SyncService],
})
export class AttachmentModule {}
