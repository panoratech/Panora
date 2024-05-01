import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { WebhookService } from './webhook.service';
import { PrismaService } from '@@core/prisma/prisma.service';
import { LoggerService } from '@@core/logger/logger.service';
import { WebhookProcessor } from './webhook.processor';
import { WebhookController } from './webhook.controller';
import { ValidateUserService } from '@@core/utils/services/validateUser.service';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'webhookDelivery',
    }),
  ],
  controllers: [WebhookController],
  exports: [
    BullModule.registerQueue({
      name: 'webhookDelivery',
    }),
  ],
  providers: [
    WebhookService,
    PrismaService,
    LoggerService,
    WebhookProcessor,
    ValidateUserService,
  ],
})
export class WebhookModule {}
