import { Module } from '@nestjs/common';
import { PaymentController } from './payment.controller';
import { SyncService } from './sync/sync.service';
import { LoggerService } from '@@core/logger/logger.service';
import { PaymentService } from './services/payment.service';
import { ServiceRegistry } from './services/registry.service';
import { EncryptionService } from '@@core/encryption/encryption.service';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { PrismaService } from '@@core/prisma/prisma.service';
import { WebhookService } from '@@core/webhook/webhook.service';
import { BullModule } from '@nestjs/bull';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'webhookDelivery',
    }),
  ],
  controllers: [PaymentController],
  providers: [
    PaymentService,
    PrismaService,
    LoggerService,
    SyncService,
    WebhookService,
    EncryptionService,
    FieldMappingService,
    ServiceRegistry,
    /* PROVIDERS SERVICES */

  ],
  exports: [SyncService],
})
export class PaymentModule {}

