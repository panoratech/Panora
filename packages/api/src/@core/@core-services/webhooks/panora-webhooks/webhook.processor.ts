import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { Queues } from '@@core/@core-services/queues/types';
import { OnQueueActive, Process, Processor } from '@nestjs/bull';
import axios from 'axios';
import { Job } from 'bull';
import { v4 as uuidv4 } from 'uuid';
import { WebhookService } from './webhook.service';

@Processor(Queues.PANORA_WEBHOOKS_SENDER)
export class WebhookProcessor {
  constructor(
    private logger: LoggerService,
    private prisma: PrismaService,
    private webhookService: WebhookService,
  ) {
    this.logger.setContext(WebhookProcessor.name);
  }

  @OnQueueActive()
  onActive(job: Job) {
    this.logger.log(`[Panora Webhook Queue] Processing job ${job.id} ...`);
  }

  @Process({ concurrency: 5 })
  async processWebhooks(job: Job) {
    const id_webhook_delivery = job.data.webhook_delivery_id;

    this.logger.log(`Start delivering webhook id ${id_webhook_delivery}...`);

    await this.prisma.webhook_delivery_attempts.update({
      where: { id_webhook_delivery_attempt: id_webhook_delivery },
      data: {
        status: 'processed',
      },
    });

    // Retrieve the webhook delivery attempt
    const deliveryAttempt =
      await this.prisma.webhook_delivery_attempts.findUnique({
        where: { id_webhook_delivery_attempt: id_webhook_delivery },
        include: {
          webhook_endpoints: true,
          webhooks_payloads: true,
        },
      });

    const event = await this.prisma.events.findUnique({
      where: {
        id_event: deliveryAttempt.id_event,
      },
    });

    // Check if the endpoint is active
    if (deliveryAttempt.webhook_endpoints.active) {
      try {
        // Send the payload to the endpoint URL
        //create a signature
        const signature = this.webhookService.generateSignature(
          deliveryAttempt.webhooks_payloads.data,
          deliveryAttempt.webhook_endpoints.secret,
        );
        let response;
        try {
          response = await axios.post(
            deliveryAttempt.webhook_endpoints.url,
            {
              id_event: deliveryAttempt.id_event,
              data: deliveryAttempt.webhooks_payloads.data,
              type: event.type,
            },
            {
              headers: {
                'Panora-Signature': signature,
              },
            },
          );
        } catch (error) {
          throw error;
        }

        // Populate the webhooks_responses table
        await this.prisma.webhooks_reponses.create({
          data: {
            id_webhooks_reponse: uuidv4(),
            http_response_data: JSON.stringify(response.data),
            http_status_code: response.status.toString(),
          },
        });
        await this.prisma.webhook_delivery_attempts.update({
          where: { id_webhook_delivery_attempt: id_webhook_delivery },
          data: {
            status: 'success',
          },
        });

        this.logger.log('Webhook delivered !');
      } catch (error) {
        // TODO: If the POST request fails, set a next retry time and reinsert the job in the queue
        /*const nextRetry = new Date();
        nextRetry.setSeconds(nextRetry.getSeconds() + 60); // Retry after 60 seconds

        await this.prisma.webhook_delivery_attempts.update({
          where: { id_webhook_delivery_attempt: id_webhook_delivery },
          data: {
            status: 'failed',
            next_retry: nextRetry,
          },
        });

        //re-insert the webhook in the queue
        await this.webhookService.dispatchFailedWebhook(id_webhook_delivery);*/

        this.logger.log(
          `Webhook delivery failed. Job reinserted in the queue for retry : ${error}`,
        );
      }
    } else {
      this.logger.log('Webhook endpoint is not active. Delivery skipped.');
    }
  }
}
