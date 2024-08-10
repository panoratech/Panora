import { BullQueueModule } from '@@core/@core-services/queues/queue.module';

import { IngestDataService } from '@@core/@core-services/unification/ingest-data.service';
import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
import { Module } from '@nestjs/common';
import { Utils } from '@ticketing/@lib/@utils';
import { ContactController } from './contact.controller';
import { ContactService } from './services/contact.service';
import { FrontService } from './services/front';
import { FrontContactMapper } from './services/front/mappers';
import { GorgiasService } from './services/gorgias';
import { GorgiasContactMapper } from './services/gorgias/mappers';
import { ServiceRegistry } from './services/registry.service';
import { ZendeskService } from './services/zendesk';
import { ZendeskContactMapper } from './services/zendesk/mappers';
import { SyncService } from './sync/sync.service';
@Module({
  controllers: [ContactController],
  providers: [
    ContactService,
    SyncService,
    WebhookService,
    ServiceRegistry,
    Utils,
    IngestDataService,
    /* PROVIDERS SERVICES */
    ZendeskService,
    FrontService,
    GorgiasService,
    /* PROVIDERS MAPPERS */
    ZendeskContactMapper,
    FrontContactMapper,
    GorgiasContactMapper,
  ],
  exports: [SyncService, ServiceRegistry, WebhookService],
})
export class ContactModule {}
