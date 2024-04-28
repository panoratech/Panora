import { Module } from '@nestjs/common';
import { TagController } from './tag.controller';
import { SyncService } from './sync/sync.service';
import { LoggerService } from '@@core/logger/logger.service';
import { TagService } from './services/tag.service';
import { ServiceRegistry } from './services/registry.service';
import { EncryptionService } from '@@core/encryption/encryption.service';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { PrismaService } from '@@core/prisma/prisma.service';
import { WebhookService } from '@@core/webhook/webhook.service';
import { BullModule } from '@nestjs/bull';
import { FrontService } from './services/front';
import { ZendeskService } from './services/zendesk';
import { JiraService } from './services/jira';
import { GorgiasService } from './services/gorgias';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'webhookDelivery',
    }),
  ],
  controllers: [TagController],
  providers: [
    TagService,
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
    JiraService,
    GorgiasService,
  ],
  exports: [SyncService],
})
export class TagModule {}
