import { Module } from '@nestjs/common';
import { RateLimitJobProcessor } from './rate-limit.consumer';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';

@Module({
  providers: [RateLimitJobProcessor, WebhookService, PrismaService],
})
export class RateLimitModule {}
