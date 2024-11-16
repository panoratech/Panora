import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { Queues } from '@@core/@core-services/queues/types';
import { CrmWebhookHandlerService } from '@crm/@webhook/handler.service';
import { OnQueueActive, Process, Processor } from '@nestjs/bull';
import { ConnectorCategory } from '@panora/shared';
import { TicketingWebhookHandlerService } from '@ticketing/@webhook/handler.service';
import { Job } from 'bull';

@Processor(Queues.REMOTE_REAL_TIME_WEBHOOKS_RECEIVER)
export class MwHandlerProcessor {
  constructor(
    private logger: LoggerService,
    private prisma: PrismaService,
    private ticketingHandler: TicketingWebhookHandlerService,
    private crmHandler: CrmWebhookHandlerService,
  ) {
    this.logger.setContext(MwHandlerProcessor.name);
  }

  @OnQueueActive()
  onActive(job: Job) {
    this.logger.log(`[Realtime Webhook Queue] Processing job ${job.id} ...`);
  }

  @Process({ concurrency: 5 })
  async processReceivedRealtimeWebhooks(job: Job) {
    const res = await this.prisma.managed_webhooks.findFirst({
      where: {
        endpoint: job.data.uuid,
      },
    });
    this.logger.log(
      `Start processing incoming realtime-webhook id ${res.id_managed_webhook}...`,
    );

    const connection = await this.prisma.connections.findFirst({
      where: {
        id_connection: res.id_connection,
      },
    });
    const metadata = {
      connector_name: connection.provider_slug,
      id_managed_webhook: res.id_managed_webhook,
      payload: job.data.data,
      headers: job.data.headers,
    };
    switch (connection.vertical) {
      case ConnectorCategory.Ticketing:
        return await this.ticketingHandler.handleExternalIncomingWebhook(
          metadata,
        );
      case ConnectorCategory.Crm:
        return await this.crmHandler.handleExternalIncomingWebhook(metadata);
      case ConnectorCategory.Accounting:
        return;
      case ConnectorCategory.FileStorage:
        return;
      case ConnectorCategory.MarketingAutomation:
        return;
    }
  }
}
