import { MicrosoftdynamicssalesEngagementMapper } from './services/microsoftdynamicssales/mappers';
import { MicrosoftdynamicssalesService } from './services/microsoftdynamicssales';
import { EncryptionService } from '@@core/@core-services/encryption/encryption.service';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { BullQueueModule } from '@@core/@core-services/queues/queue.module';

import { CoreUnification } from '@@core/@core-services/unification/core-unification.service';
import { IngestDataService } from '@@core/@core-services/unification/ingest-data.service';
import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
import { ConnectionUtils } from '@@core/connections/@utils';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { Utils } from '@crm/@lib/@utils';
import { Module } from '@nestjs/common';
import { EngagementController } from './engagement.controller';
import { CloseService } from './services/close';
import { CloseEngagementMapper } from './services/close/mappers';
import { EngagementService } from './services/engagement.service';
import { HubspotService } from './services/hubspot';
import { HubspotEngagementMapper } from './services/hubspot/mappers';
import { PipedriveService } from './services/pipedrive';
import { PipedriveEngagementMapper } from './services/pipedrive/mappers';
import { ServiceRegistry } from './services/registry.service';
import { ZendeskService } from './services/zendesk';
import { ZendeskEngagementMapper } from './services/zendesk/mappers';
import { ZohoService } from './services/zoho';
import { ZohoEngagementMapper } from './services/zoho/mappers';
import { SyncService } from './sync/sync.service';
@Module({
  controllers: [EngagementController],
  providers: [
    EngagementService,

    SyncService,
    WebhookService,

    FieldMappingService,
    ServiceRegistry,

    Utils,
    IngestDataService,
    /* PROVIDERS SERVICES */
    ZendeskService,
    ZohoService,
    PipedriveService,
    HubspotService,
    CloseService,
    /* PROVIDERS MAPPERS */
    ZendeskEngagementMapper,
    ZohoEngagementMapper,
    PipedriveEngagementMapper,
    HubspotEngagementMapper,
    CloseEngagementMapper,
    MicrosoftdynamicssalesService,
    MicrosoftdynamicssalesEngagementMapper,
  ],
  exports: [SyncService, ServiceRegistry, WebhookService],
})
export class EngagementModule {}
