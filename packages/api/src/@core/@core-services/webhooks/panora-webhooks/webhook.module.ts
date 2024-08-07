import { BullQueueModule } from '@@core/@core-services/queues/queue.module';
import { ValidateUserService } from '@@core/utils/services/validate-user.service';
import { Module } from '@nestjs/common';
import { WebhookController } from './webhook.controller';
import { WebhookProcessor } from './webhook.processor';
import { WebhookService } from './webhook.service';

@Module({
  controllers: [WebhookController],
  providers: [WebhookService, WebhookProcessor, ValidateUserService],
  exports: [WebhookService, WebhookProcessor, ValidateUserService],
})
export class WebhookModule {}
