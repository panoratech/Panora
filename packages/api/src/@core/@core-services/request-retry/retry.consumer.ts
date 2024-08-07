import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { RetryHandler } from './retry.handler';
import { Queues } from '../queues/types';
import { WebhookService } from '../webhooks/panora-webhooks/webhook.service';
import { PrismaService } from '../prisma/prisma.service';
import { v4 as uuidv4 } from 'uuid';
import { ConfigType } from './types';

@Processor(Queues.FAILED_PASSTHROUGH_REQUESTS_HANDLER)
export class RetryProcessor {
  constructor(
    private readonly retryHandler: RetryHandler,
    private webhook: WebhookService,
    private prisma: PrismaService,
  ) {}

  private extractProvider(event_type: string): string {
    const parts = event_type.split('.');
    if (parts.length >= 2) {
      return parts[1];
    }
    throw new Error(`Invalid event_type format: ${event_type}`);
  }

  @Process('retry-request')
  async handleRetry(
    job: Job<{
      retryId: string;
      config: ConfigType;
      event_type: string;
      linkedUserId: string;
    }>,
  ) {
    const { config, event_type, linkedUserId } = job.data;
    try {
      const result = await this.retryHandler.retryWithBackoff(config);
      const linkedUser = await this.prisma.linked_users.findUnique({
        where: {
          id_linked_user: linkedUserId,
        },
      });
      const event = await this.prisma.events.create({
        data: {
          id_connection: '',
          id_project: linkedUser.id_project,
          id_event: uuidv4(),
          status: String(result.status),
          type: event_type,
          method: config.method,
          url: config.url,
          provider: this.extractProvider(event_type),
          direction: '0',
          timestamp: new Date(),
          id_linked_user: linkedUserId,
        },
      });
      //add it to panora webhook queue so it can be sent through a webhook aysnchronosly
      await this.webhook.dispatchWebhook(
        result,
        event_type,
        linkedUser.id_project,
        event.id_event,
      );
      return result;
    } catch (error) {
      // Handle or log the error as needed
      throw error;
    }
  }
}
