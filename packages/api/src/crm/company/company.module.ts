import { Module } from '@nestjs/common';
import { CompanyController } from './company.controller';
import { SyncService } from './sync/sync.service';
import { LoggerService } from '@@core/logger/logger.service';
import { CompanyService } from './services/company.service';
import { ServiceRegistry } from './services/registry.service';
import { EncryptionService } from '@@core/encryption/encryption.service';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { PrismaService } from '@@core/prisma/prisma.service';
import { WebhookService } from '@@core/webhook/webhook.service';
import { BullModule } from '@nestjs/bull';
import { ConnectionUtils } from '@@core/connections/@utils';
import { HubspotService } from './services/hubspot';
import { PipedriveService } from './services/pipedrive';
import { ZendeskService } from './services/zendesk';
import { ZohoService } from './services/zoho';
import { AttioService } from './services/attio';
import { CloseService } from './services/close';
import { MappersRegistry } from '@@core/utils/registry/mappings.registry';
import { UnificationRegistry } from '@@core/utils/registry/unification.registry';
import { CoreUnification } from '@@core/utils/services/core.service';
import { Utils } from '@crm/@lib/@utils';
import { AttioCompanyMapper } from './services/attio/mappers';
import { CloseCompanyMapper } from './services/close/mappers';
import { HubspotCompanyMapper } from './services/hubspot/mappers';
import { PipedriveCompanyMapper } from './services/pipedrive/mappers';
import { ZendeskCompanyMapper } from './services/zendesk/mappers';
import { ZohoCompanyMapper } from './services/zoho/mappers';



@Module({
  imports: [
    BullModule.registerQueue(
      { name: 'webhookDelivery' },
      { name: 'syncTasks' },
    ),
  ],
  controllers: [CompanyController],
  providers: [
    CompanyService,

    LoggerService,
    SyncService,
    WebhookService,
    EncryptionService,
    FieldMappingService,
    ServiceRegistry,
    ConnectionUtils,
    CoreUnification,
    // UnificationRegistry,
    // MappersRegistry,
    Utils,
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
    ZohoCompanyMapper

  ],
  exports: [
    SyncService,
    ServiceRegistry,
    WebhookService,
    FieldMappingService,
    LoggerService,
  ],
})
export class CompanyModule { }
