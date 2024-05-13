import { GitlabService } from './services/gitlab';
import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { SyncService } from './sync/sync.service';
import { LoggerService } from '@@core/logger/logger.service';
import { UserService } from './services/user.service';
import { ServiceRegistry } from './services/registry.service';
import { EncryptionService } from '@@core/encryption/encryption.service';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { PrismaService } from '@@core/prisma/prisma.service';
import { WebhookService } from '@@core/webhook/webhook.service';
import { BullModule } from '@nestjs/bull';
import { ZendeskService } from './services/zendesk';
import { FrontService } from './services/front';
import { JiraService } from './services/jira';
import { GorgiasService } from './services/gorgias';

@Module({
  imports: [
    BullModule.registerQueue(
      {
        name: 'webhookDelivery',
      },
      { name: 'syncTasks' },
    ),
  ],
  controllers: [UserController],
  providers: [
    UserService,
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
    GitlabService,
  ],
  exports: [
    SyncService,
    ServiceRegistry,
    WebhookService,
    FieldMappingService,
    LoggerService,
    PrismaService,
  ],
})
export class UserModule {}
