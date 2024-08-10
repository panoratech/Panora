import { BullQueueModule } from '@@core/@core-services/queues/queue.module';
import { IngestDataService } from '@@core/@core-services/unification/ingest-data.service';
import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
import { Utils } from '@crm/@lib/@utils';
import { Module } from '@nestjs/common';
import { OpportunityController } from './opportunity.controller';
import { OpportunityService } from './services/opportunity.service';
import { RedtailService } from './services/pipedrive';
import { RedtailOpportunityMapper } from './services/pipedrive/mappers';
import { ServiceRegistry } from './services/registry.service';
import { SyncService } from './sync/sync.service';
import { ConnectionUtils } from '@@core/connections/@utils';
import { LoggerService } from '@@core/@core-services/logger/logger.service';

@Module({
  imports: [BullQueueModule],
  controllers: [OpportunityController],
  providers: [
    OpportunityService,
    SyncService,
    WebhookService,
    ServiceRegistry,
    Utils,
    IngestDataService,
    ConnectionUtils,
    LoggerService,
    /* PROVIDERS SERVICES */
    RedtailService,
    /* PROVIDERS MAPPERS */
    RedtailOpportunityMapper,
  ],
  exports: [SyncService, ServiceRegistry, WebhookService],
})
export class OpportunityModule {}
