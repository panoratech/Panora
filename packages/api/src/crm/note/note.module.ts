import { BullQueueModule } from '@@core/@core-services/queues/queue.module';
import { IngestDataService } from '@@core/@core-services/unification/ingest-data.service';
import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
import { Utils } from '@crm/@lib/@utils';
import { Module } from '@nestjs/common';
import { NoteController } from './note.controller';
import { CloseService } from './services/close';
import { CloseNoteMapper } from './services/close/mappers';
import { HubspotService } from './services/hubspot';
import { AttioService } from './services/attio';
import { HubspotNoteMapper } from './services/hubspot/mappers';
import { NoteService } from './services/note.service';
import { PipedriveService } from './services/pipedrive';
import { PipedriveNoteMapper } from './services/pipedrive/mappers';
import { ServiceRegistry } from './services/registry.service';
import { ZendeskService } from './services/zendesk';
import { ZendeskNoteMapper } from './services/zendesk/mappers';
import { ZohoService } from './services/zoho';
import { ZohoNoteMapper } from './services/zoho/mappers';
import { AttioNoteMapper } from './services/attio/mappers';
import { SyncService } from './sync/sync.service';
@Module({
  imports: [BullQueueModule],
  controllers: [NoteController],
  providers: [
    NoteService,
    SyncService,
    WebhookService,
    ServiceRegistry,
    Utils,
    IngestDataService,
    /* PROVIDERS SERVICES */
    ZendeskService,
    ZohoService,
    PipedriveService,
    HubspotService,
    AttioService,
    CloseService,
    /* PROVIDERS MAPPERS */
    ZendeskNoteMapper,
    ZohoNoteMapper,
    PipedriveNoteMapper,
    AttioNoteMapper,
    HubspotNoteMapper,
    CloseNoteMapper,
  ],
  exports: [SyncService, ServiceRegistry, WebhookService],
})
export class NoteModule {}
