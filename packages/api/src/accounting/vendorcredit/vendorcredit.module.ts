import { Module } from '@nestjs/common';
import { VendorcreditController } from './vendorcredit.controller';
import { SyncService } from './sync/sync.service';
import { LoggerService } from '@@core/logger/logger.service';
import { VendorcreditService } from './services/vendorcredit.service';
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
  controllers: [VendorcreditController],
  providers: [
    VendorcreditService,
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
export class VendorcreditModule {}

