import { EncryptionService } from '@@core/@core-services/encryption/encryption.service';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { MappersRegistry } from '@@core/@core-services/registries/mappers.registry';
import { UnificationRegistry } from '@@core/@core-services/registries/unification.registry';
import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
import { ConnectionUtils } from '@@core/connections/@utils';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { Utils } from '@crm/@lib/@utils';
import { Module } from '@nestjs/common';
import { CloseService } from './services/close';
import { HubspotService } from './services/hubspot';
import { PipedriveService } from './services/pipedrive';
import { ServiceRegistry } from './services/registry.service';
import { StageService } from './services/stage.service';
import { ZendeskService } from './services/zendesk';
import { ZohoService } from './services/zoho';
import { StageController } from './stage.controller';
import { SyncService } from './sync/sync.service';
import { CoreUnification } from '@@core/@core-services/unification/core-unification.service';

@Module({
  imports: [],
  controllers: [StageController],
  providers: [
    StageService,
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
export class StageModule {}
