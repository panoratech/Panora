import { DixaService } from './services/dixa';
import { GitlabService } from './services/gitlab';
import { Module } from '@nestjs/common';
import { TicketController } from './ticket.controller';
import { TicketService } from './services/ticket.service';
import { SyncService } from './sync/sync.service';
import { WebhookService } from '@@core/webhook/webhook.service';
import { EncryptionService } from '@@core/encryption/encryption.service';
import { LoggerService } from '@@core/logger/logger.service';
import { PrismaService } from '@@core/prisma/prisma.service';
import { ZendeskService } from './services/zendesk';
import { BullModule } from '@nestjs/bull';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { ServiceRegistry } from './services/registry.service';
import { HubspotService } from './services/hubspot';
import { FrontService } from './services/front';
import { GithubService } from './services/github';
import { JiraService } from './services/jira';
import { GorgiasService } from './services/gorgias';
import { CoreUnification } from '@@core/utils/services/core.service';
import { UnificationRegistry } from '@@core/utils/registry/unification.registry';
import { MappersRegistry } from '@@core/utils/registry/mappings.registry';
import { Utils } from '@ticketing/@lib/@utils';
import { ConnectionUtils } from '@@core/connections/@utils';

@Module({
  imports: [
    BullModule.registerQueue(
      {
        name: 'webhookDelivery',
      },
      { name: 'syncTasks' },
    ),
  ],
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
    DixaService,
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
