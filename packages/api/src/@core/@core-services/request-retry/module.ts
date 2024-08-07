import { Module } from '@nestjs/common';
import { RetryProcessor } from './retry.consumer';
import { RetryHandler } from './retry.handler';
import { WebhookService } from '../webhooks/panora-webhooks/webhook.service';

@Module({
  providers: [RetryProcessor, RetryHandler, WebhookService],
  exports: [RetryProcessor, RetryHandler],
})
export class RetryModule {}
