import { GitlabService } from './services/gitlab';
import { Module } from '@nestjs/common';
import { TicketController } from './ticket.controller';
import { TicketService } from './services/ticket.service';
import { SyncService } from './sync/sync.service';
import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
import { EncryptionService } from '@@core/@core-services/encryption/encryption.service';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { ZendeskService } from './services/zendesk';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { ServiceRegistry } from './services/registry.service';
import { HubspotService } from './services/hubspot';
import { FrontService } from './services/front';
import { GithubService } from './services/github';
import { JiraService } from './services/jira';
import { GorgiasService } from './services/gorgias';
import { UnificationRegistry } from '@@core/@core-services/registries/unification.registry';
import { MappersRegistry } from '@@core/@core-services/registries/mappers.registry';
import { Utils } from '@ticketing/@lib/@utils';
import { ConnectionUtils } from '@@core/connections/@utils';
import { CoreUnification } from '@@core/@core-services/unification/core-unification.service';

@Module({
  imports: [],
  controllers: [TicketController],
  providers: [
    TicketService,
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
    HubspotService,
    FrontService,
    GithubService,
    JiraService,
    GorgiasService,
    GitlabService,
  ],
  exports: [
    SyncService,
    ServiceRegistry,
    WebhookService,
    FieldMappingService,
    LoggerService,
  ],
})
export class TicketModule {}
