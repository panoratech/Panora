import { Module } from '@nestjs/common';
import { AttachmentController } from './attachment.controller';
import { LoggerService } from '@@core/logger/logger.service';
import { AttachmentService } from './services/attachment.service';
import { ServiceRegistry } from './services/registry.service';
import { EncryptionService } from '@@core/encryption/encryption.service';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { PrismaService } from '@@core/prisma/prisma.service';
import { WebhookService } from '@@core/webhook/webhook.service';
import { BullModule } from '@nestjs/bull';
import { ConnectionUtils } from '@@core/connections/@utils';
import { MappersRegistry } from '@@core/utils/registry/mappings.registry';
import { UnificationRegistry } from '@@core/utils/registry/unification.registry';
import { CoreUnification } from '@@core/utils/services/core.service';
import { FrontAttachmentMapper } from './services/front/mappers';
import { GorgiasAttachmentMapper } from './services/gorgias/mappers';
import { JiraAttachmentMapper } from './services/jira/mappers';
import { ZendeskAttachmentMapper } from './services/zendesk/mappers';
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
  controllers: [AttachmentController],
  providers: [
    AttachmentService,

    LoggerService,
    WebhookService,
    EncryptionService,
    FieldMappingService,
    ServiceRegistry,
    ConnectionUtils,
    CoreUnification,
    Utils,
    // UnificationRegistry,
    // MappersRegistry,
    /* PROVIDERS SERVICES */

    /* PROVIDERS Mappers */
    FrontAttachmentMapper,
    GorgiasAttachmentMapper,
    JiraAttachmentMapper,
    ZendeskAttachmentMapper


  ],
})
export class AttachmentModule { }
