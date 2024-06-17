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
import { ConnectionUtils } from '@@core/connections/@utils';
import { FrontService } from './services/front';
import { ZendeskService } from './services/zendesk';
import { JiraService } from './services/jira';
import { GorgiasService } from './services/gorgias';
import { MappersRegistry } from '@@core/utils/registry/mappings.registry';
import { UnificationRegistry } from '@@core/utils/registry/unification.registry';
import { CoreUnification } from '@@core/utils/services/core.service';
import { Utils } from '@ticketing/@lib/@utils';

@Module({
  imports: [
    BullModule.registerQueue(
      {
        name: 'webhookDelivery',
      },
      { name: 'syncTasks' },
    ),
  ],
  controllers: [TagController],
  providers: [
    TagService,
    
    LoggerService,
    SyncService,
    WebhookService,
    EncryptionService,
    FieldMappingService,
    ServiceRegistry,
ConnectionUtils,
    CoreUnification,
    UnificationRegistry,
    MappersRegistry,
    Utils,
    /* PROVIDERS SERVICES */
    ZendeskService,
    FrontService,
    JiraService,
    GorgiasService,
  ],
  exports: [
    SyncService,
    ServiceRegistry,
    WebhookService,
    FieldMappingService,
    LoggerService,
    
  ],
})
export class TagModule {}
