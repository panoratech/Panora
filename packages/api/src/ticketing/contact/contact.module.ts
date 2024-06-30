import { DixaService } from './services/dixa';
import { Module } from '@nestjs/common';
import { SyncService } from './sync/sync.service';
import { WebhookService } from '@@core/webhook/webhook.service';
import { EncryptionService } from '@@core/encryption/encryption.service';
import { LoggerService } from '@@core/logger/logger.service';
import { PrismaService } from '@@core/prisma/prisma.service';
import { ZendeskService } from './services/zendesk';
import { BullModule } from '@nestjs/bull';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { ServiceRegistry } from './services/registry.service';
import { ContactService } from './services/contact.service';
import { ContactController } from './contact.controller';
import { FrontService } from './services/front';
import { GorgiasService } from './services/gorgias';
import { MappersRegistry } from '@@core/utils/registry/mappings.registry';
import { UnificationRegistry } from '@@core/utils/registry/unification.registry';
import { CoreUnification } from '@@core/utils/services/core.service';
import { Utils } from '@ticketing/@lib/@utils';
import { ConnectionUtils } from '@@core/connections/@utils';

@Module({
  imports: [
    BullModule.registerQueue(
      {
        name: 'webhookDelivery',
      },
      { name: 'syncTasks' },
    ),
  ],
  controllers: [ContactController],
  providers: [
    ContactService,

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
    GorgiasService,
    DixaService,
  ],
  exports: [
    SyncService,
    ServiceRegistry,
    WebhookService,
    FieldMappingService,
    LoggerService,
  ],
})
export class ContactModule {}
