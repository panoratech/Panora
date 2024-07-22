import { EncryptionService } from '@@core/@core-services/encryption/encryption.service';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { BullQueueModule } from '@@core/@core-services/queues/queue.module';
import { CoreUnification } from '@@core/@core-services/unification/core-unification.service';
import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
import { ConnectionUtils } from '@@core/connections/@utils';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { Module } from '@nestjs/common';
import { Utils } from '@ticketing/@lib/@utils';
import { AttachmentController } from './attachment.controller';
import { AttachmentService } from './services/attachment.service';
import { FrontAttachmentMapper } from './services/front/mappers';
import { GorgiasAttachmentMapper } from './services/gorgias/mappers';
import { JiraAttachmentMapper } from './services/jira/mappers';
import { ServiceRegistry } from './services/registry.service';
import { ZendeskAttachmentMapper } from './services/zendesk/mappers';

import { IngestDataService } from '@@core/@core-services/unification/ingest-data.service';
@Module({
  controllers: [AttachmentController],
  providers: [
    AttachmentService,

    WebhookService,

    ServiceRegistry,

    Utils,

    IngestDataService,
    /* PROVIDERS SERVICES */

    /* PROVIDERS Mappers */
    FrontAttachmentMapper,
    GorgiasAttachmentMapper,
    JiraAttachmentMapper,
    ZendeskAttachmentMapper,
  ],
})
export class AttachmentModule {}
