import { Module } from '@nestjs/common';
import { CashflowstatementController } from './cashflowstatement.controller';
import { SyncService } from './sync/sync.service';
import { LoggerService } from '@@core/logger/logger.service';
import { CashflowstatementService } from './services/cashflowstatement.service';
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
  controllers: [CashflowstatementController],
  providers: [
    CashflowstatementService,
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
export class CashflowstatementModule {}

