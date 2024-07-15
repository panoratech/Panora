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
import { CompanyController } from './company.controller';
import { AttioService } from './services/attio';
import { AttioCompanyMapper } from './services/attio/mappers';
import { CloseService } from './services/close';
import { CloseCompanyMapper } from './services/close/mappers';
import { CompanyService } from './services/company.service';
import { HubspotService } from './services/hubspot';
import { HubspotCompanyMapper } from './services/hubspot/mappers';
import { PipedriveService } from './services/pipedrive';
import { PipedriveCompanyMapper } from './services/pipedrive/mappers';
import { ServiceRegistry } from './services/registry.service';
import { ZendeskService } from './services/zendesk';
import { ZendeskCompanyMapper } from './services/zendesk/mappers';
import { ZohoService } from './services/zoho';
import { ZohoCompanyMapper } from './services/zoho/mappers';
import { SyncService } from './sync/sync.service';

@Module({
  imports: [BullQueueModule],
  controllers: [CompanyController],
  providers: [
    CompanyService,

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
    AttioCompanyMapper,
    CloseCompanyMapper,
    HubspotCompanyMapper,
    PipedriveCompanyMapper,
    ZendeskCompanyMapper,
    ZohoCompanyMapper,
  ],
  exports: [SyncService, ServiceRegistry, WebhookService],
})
export class CompanyModule {}
