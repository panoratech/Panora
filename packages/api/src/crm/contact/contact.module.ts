import { EncryptionService } from '@@core/@core-services/encryption/encryption.service';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { MappersRegistry } from '@@core/@core-services/registries/mappers.registry';
import { UnificationRegistry } from '@@core/@core-services/registries/unification.registry';
import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
import { ConnectionUtils } from '@@core/connections/@utils';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { Utils } from '@crm/@lib/@utils';
import { Module } from '@nestjs/common';
import { ContactController } from './contact.controller';
import { AttioService } from './services/attio';
import { CloseService } from './services/close';
import { ContactService } from './services/contact.service';
import { HubspotService } from './services/hubspot';
import { PipedriveService } from './services/pipedrive';
import { ServiceRegistry } from './services/registry.service';
import { ZendeskService } from './services/zendesk';
import { ZohoService } from './services/zoho';
import { SyncService } from './sync/sync.service';
import { CoreUnification } from '@@core/@core-services/unification/core-unification.service';
import { IngestDataService } from '@@core/@core-services/unification/ingest-data.service';

@Module({
  imports: [],
  controllers: [ContactController],
  providers: [
    ContactService,
    LoggerService,
    FieldMappingService,
    SyncService,
    WebhookService,
    EncryptionService,
    ServiceRegistry,
    CoreUnification,
    UnificationRegistry,
    MappersRegistry,
    Utils,
    ConnectionUtils,
    IngestDataService,
    /* PROVIDERS SERVICES */
    AttioService,
    ZendeskService,
    ZohoService,
    PipedriveService,
    HubspotService,
    CloseService,
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
