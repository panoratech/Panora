import { Injectable } from '@nestjs/common';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { v4 as uuidv4 } from 'uuid';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { WebhooksError } from '@@core/utils/errors';
import { EventPayload, WebhookDto } from './dto/webhook.dto';
import axios from 'axios';
import { createHmac } from 'crypto';
import { BullQueueService } from '@@core/@core-services/queues/shared.service';

@Injectable()
export class WebhookService {
  constructor(
    private readonly queues: BullQueueService,
    private prisma: PrismaService,
    private logger: LoggerService,
  ) {
    this.logger.setContext(WebhookService.name);
  }

  private safeSerialize(data: any): any {
    return JSON.parse(
      JSON.stringify(data, (key, value) => {
        if (typeof value === 'bigint') {
          return value.toString();
        }
        if (value instanceof Date) {
          return value.toISOString();
        }
        if (typeof value === 'function') {
          return value.toString();
        }
        if (value === undefined) {
          return null;
        }
        if (typeof value === 'symbol') {
          return value.toString();
        }
        if (
          value !== null &&
          typeof value === 'object' &&
          !Array.isArray(value)
        ) {
          if (value.toJSON && typeof value.toJSON === 'function') {
            return value.toJSON();
          }
          const proto = Object.getPrototypeOf(value);
          if (
            proto &&
            proto.constructor &&
            proto.constructor.name !== 'Object'
          ) {
            return `[object ${proto.constructor.name}]`;
          }
        }
        return value;
      }),
    );
  }

  generateSignature(payload: any, secret: string): string {
    try {
      return createHmac('sha256', secret)
        .update(JSON.stringify(payload))
        .digest('hex');
    } catch (error) {
      throw error;
    }
  }

  async getWebhookEndpoints(project_id: string) {
    try {
      return await this.prisma.webhook_endpoints.findMany({
        where: {
          id_project: project_id,
        },
      });
    } catch (error) {
      throw error;
    }
  }

  async updateStatusWebhookEndpoint(
    id: string,
    active: boolean,
    projectId: string,
  ) {
    try {
      return await this.prisma.webhook_endpoints.update({
        where: {
          id_webhook_endpoint: id,
          id_project: projectId,
        },
        data: { active: active },
      });
    } catch (error) {
      throw error;
    }
  }

  async createWebhookEndpoint(data: WebhookDto, projectId: string) {
    try {
      return await this.prisma.webhook_endpoints.create({
        data: {
          id_webhook_endpoint: uuidv4(),
          url: data.url,
          endpoint_description: data.description ? data.description : '',
          secret: uuidv4(),
          active: true,
          created_at: new Date(),
          id_project: projectId,
          scope: data.scope,
        },
      });
    } catch (error) {
      throw error;
    }
  }

  async deleteWebhook(whId: string, projectId: string) {
    try {
      return await this.prisma.webhook_endpoints.delete({
        where: {
          id_webhook_endpoint: whId,
          id_project: projectId,
        },
      });
    } catch (error) {
      throw error;
    }
  }

  async dispatchWebhook(
    data: any,
    eventType: string,
    projectId: string,
    eventId: string,
  ) {
    try {
      this.logger.log(
        `Handling Panora Webhook for event: ${eventType} and projectId: ${projectId}`,
      );
      //just create an entry in webhook
      //search if an endpoint webhook exists for such a projectId and such a scope
      const webhooks = await this.prisma.webhook_endpoints.findMany({
        where: {
          id_project: projectId,
          active: true,
        },
      });

      // we dont deliver the webhook
      if (!webhooks) return;

      const webhook = webhooks.find((wh) => {
        const scopes = wh.scope;
        return scopes.includes(eventType);
      });

      // we dont deliver the webhook
      if (!webhook) return;

      this.logger.log('handling webhook payload....');
      const serializedData = this.safeSerialize(data);
      const w_payload = await this.prisma.webhooks_payloads.create({
        data: {
          id_webhooks_payload: uuidv4(),
          data: JSON.stringify(serializedData),
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
          attempt_count: 0,
        },
      });
      this.logger.log('adding webhook to the queue ');
      // we send the delivery webhook to the queue so it can be processed by our dispatcher worker
      await this.queues.getPanoraWebhookSender().add({
        webhook_delivery_id: w_delivery.id_webhook_delivery_attempt,
      });
    } catch (error) {
      throw error;
    }
  }

  async deliverWebhook(
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
        const scopes = wh.scope;
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
          status: 'processed', // queued | processed | failed | success
          id_webhooks_payload: w_payload.id_webhooks_payload,
          attempt_count: 0,
        },
      });
      this.logger.log('sending the webhook to the client ');
      // we send the delivery webhook to the queue so it can be processed by our dispatcher worker
      // Retrieve the webhook delivery attempt details
      const deliveryAttempt =
        await this.prisma.webhook_delivery_attempts.findUnique({
          where: {
            id_webhook_delivery_attempt: w_delivery.id_webhook_delivery_attempt,
          },
          include: {
            webhook_endpoints: true,
            webhooks_payloads: true,
          },
        });

      // Check if the endpoint is active
      if (deliveryAttempt.webhook_endpoints.active) {
        try {
          // Send the payload to the endpoint URL
          const response = await axios.post(
            deliveryAttempt.webhook_endpoints.url,
            {
              id_event: deliveryAttempt.id_event,
              data: deliveryAttempt.webhooks_payloads.data,
              type: eventType,
            },
            {
              headers: {
                'Panora-Signature': this.generateSignature(
                  deliveryAttempt.webhooks_payloads.data,
                  deliveryAttempt.webhook_endpoints.secret,
                ),
              },
            },
          );

          // Populate the webhooks_responses table
          await this.prisma.webhooks_reponses.create({
            data: {
              id_webhooks_reponse: uuidv4(),
              http_response_data: response.data,
              http_status_code: response.status.toString(),
            },
          });
          await this.prisma.webhook_delivery_attempts.update({
            where: {
              id_webhook_delivery_attempt:
                w_delivery.id_webhook_delivery_attempt,
            },
            data: {
              status: 'success',
            },
          });
        } catch (error) {
          // If the POST request fails, set a next retry time and reinsert the job in the queue
          const nextRetry = new Date();
          nextRetry.setSeconds(nextRetry.getSeconds() + 60); // Retry after 60 seconds

          await this.prisma.webhook_delivery_attempts.update({
            where: {
              id_webhook_delivery_attempt:
                w_delivery.id_webhook_delivery_attempt,
            },
            data: {
              status: 'failed',
              next_retry: nextRetry,
            },
          });

          //re-insert the webhook in the queue
          await this.dispatchFailedWebhook(
            w_delivery.id_webhook_delivery_attempt,
          );
        }
      }
    } catch (error) {
      throw error;
    }
  }

  async dispatchFailedWebhook(failed_id_delivery_webhook: string) {
    try {
      await this.queues.getPanoraWebhookSender().add(
        {
          webhook_delivery_id: failed_id_delivery_webhook,
        },
        { delay: 60000 },
      );
    } catch (error) {
      throw error;
    }
  }

  async verifyPayloadSignature(
    payload: { [key: string]: any },
    signature: string,
    secret: string,
  ) {
    try {
      const expected = this.generateSignature(payload.data, secret);
      if (expected !== signature) {
        throw new WebhooksError({
          name: 'INVALID_SIGNATURE_ERROR',
          message: `Signature mismatch for the payload received with expected=${expected} and signature=${signature}`,
        });
      }
      return payload;
    } catch (error) {
      throw error;
    }
  }
}
