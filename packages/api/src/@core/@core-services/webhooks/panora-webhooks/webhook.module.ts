import { Module } from '@nestjs/common';
import { WebhookService } from './webhook.service';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { WebhookProcessor } from './webhook.processor';
import { WebhookController } from './webhook.controller';
import { BullQueueModule } from '@@core/@core-services/queues/queue.module';
import { ValidateUserService } from '@@core/utils/services/validate-user.service';

@Module({
  imports: [BullQueueModule],
  controllers: [WebhookController],
  providers: [
    WebhookService,
    LoggerService,
    WebhookProcessor,
    ValidateUserService,
  ],
})
export class WebhookModule {}
