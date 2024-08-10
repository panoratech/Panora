import { EnvironmentService } from '@@core/@core-services/environment/environment.service';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { Module } from '@nestjs/common';
import { CrmWebhookHandlerService } from './handler.service';
import { IngestDataService } from '@@core/@core-services/unification/ingest-data.service';
import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
import { BullQueueModule } from '@@core/@core-services/queues/queue.module';

@Module({
  providers: [
    EnvironmentService,
    CrmWebhookHandlerService,
    IngestDataService,
    WebhookService,
    /* PROVIDERS SERVICES */
  ],
  exports: [CrmWebhookHandlerService],
})
export class CrmWebhookHandlerModule {}
