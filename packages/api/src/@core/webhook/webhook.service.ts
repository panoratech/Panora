import { Injectable } from '@nestjs/common';
import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';
import { PrismaService } from '@@core/prisma/prisma.service';
import { v4 as uuidv4 } from 'uuid';
import { LoggerService } from '@@core/logger/logger.service';
import { handleServiceError } from '@@core/utils/errors';

@Injectable()
export class WebhookService {
  constructor(
    @InjectQueue('webhookDelivery') private queue: Queue,
    private prisma: PrismaService,
    private logger: LoggerService,
  ) {
    this.logger.setContext(WebhookService.name);
  }

  async handleWebhook(
    data: any,
    eventType: string,
    projectId: string,
    eventId: string,
  ) {
    try {
      //this.logger.log('data any type is ' + data);
      this.logger.log('handling webhook....');
      //just create an entry in webhook
      //search if an endpoint webhook exists for such a projectId and such a scope
      const webhook = await this.prisma.webhook_endpoints.findFirst({
        where: {
          id_project: projectId,
          active: true,
          scope: eventType, //todo
        },
      });
      if (!webhook) return;

      this.logger.log('handling webhook payload....');

      const w_payload = await this.prisma.webhooks_payloads.create({
        data: {
          id_webhooks_payload: uuidv4(),
          data: JSON.stringify(data),
        },
      });
      this.logger.log('handling webhook delivery....');

      const w_delivery = await this.prisma.webhook_delivery_attempts.create({
        data: {
          id_webhook_delivery_attempt: uuidv4(),
          id_event: eventId,
          timestamp: new Date(),
          id_webhook_endpoint: webhook.id_webhook_endpoint,
          status: 'queued', // queued | processed | failed | success
          id_webhooks_payload: w_payload.id_webhooks_payload,
        },
      });
      this.logger.log('adding webhook to the queue ');
      // we send the delivery webhook to the queue so it can be processed by our dispatcher worker
      const job = await this.queue.add({
        webhook_delivery_id: w_delivery.id_webhook_delivery_attempt,
      });
    } catch (error) {
      handleServiceError(error, this.logger);
    }
  }

  async handleFailedWebhook(failed_id_delivery_webhook: string) {
    try {
      await this.queue.add(
        {
          webhook_delivery_id: failed_id_delivery_webhook,
        },
        { delay: 60000 },
      );
    } catch (error) {
      handleServiceError(error, this.logger);
    }
  }
}
