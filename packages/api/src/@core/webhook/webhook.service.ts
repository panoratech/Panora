import { Injectable } from '@nestjs/common';
import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';
import { PrismaService } from '@@core/prisma/prisma.service';
import { v4 as uuidv4 } from 'uuid';
import { LoggerService } from '@@core/logger/logger.service';
import { handleServiceError } from '@@core/utils/errors';
import { WebhookDto } from './dto/webhook.dto';

@Injectable()
export class WebhookService {
  constructor(
    @InjectQueue('webhookDelivery') private queue: Queue,
    private prisma: PrismaService,
    private logger: LoggerService,
  ) {
    this.logger.setContext(WebhookService.name);
  }

  async getWebhookEndpoints() {
    try {
      return await this.prisma.webhook_endpoints.findMany();
    } catch (error) {
      handleServiceError(error, this.logger);
    }
  }
  async updateStatusWebhookEndpoint(id: string, active: boolean) {
    try {
      return await this.prisma.webhook_endpoints.update({
        where: { id_webhook_endpoint: id },
        data: { active: active },
      });
    } catch (error) {
      handleServiceError(error, this.logger);
    }
  }

  async createWebhookEndpoint(data: WebhookDto) {
    try {
      return await this.prisma.webhook_endpoints.create({
        data: {
          id_webhook_endpoint: uuidv4(),
          url: data.url,
          endpoint_description: data.description ? data.description : '',
          secret: uuidv4(),
          active: true,
          created_at: new Date(),
          id_project: data.id_project,
          scope: JSON.stringify(data.scope),
        },
      });
    } catch (error) {
      handleServiceError(error, this.logger);
    }
  }

  async handleWebhook(
    data: any,
    eventType: string,
    projectId: string,
    eventId: string,
  ) {
    try {
      this.logger.log('handling webhook....');
      //just create an entry in webhook
      //search if an endpoint webhook exists for such a projectId and such a scope
      const webhooks = await this.prisma.webhook_endpoints.findMany({
        where: {
          id_project: projectId,
          active: true,
        },
      });
      if (!webhooks) return;

      const webhook = webhooks.find((wh) => {
        const scopes = JSON.parse(wh.scope);
        return scopes.includes(eventType);
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
          attempt_count: 0, //TODO
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
