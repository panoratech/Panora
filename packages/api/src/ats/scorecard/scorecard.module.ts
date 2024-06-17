import { Module } from '@nestjs/common';
import { ScoreCardController } from './scorecard.controller';
import { SyncService } from './sync/sync.service';
import { LoggerService } from '@@core/logger/logger.service';
import { ScoreCardService } from './services/scorecard.service';
import { ServiceRegistry } from './services/registry.service';
import { EncryptionService } from '@@core/encryption/encryption.service';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { PrismaService } from '@@core/prisma/prisma.service';
import { WebhookService } from '@@core/webhook/webhook.service';
import { BullModule } from '@nestjs/bull';
import { ConnectionUtils } from '@@core/connections/@utils';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'webhookDelivery',
    }),
  ],
  controllers: [ScoreCardController],
  providers: [
    ScoreCardService,
    PrismaService,
    LoggerService,
    SyncService,
    WebhookService,
    EncryptionService,
    FieldMappingService,
    ServiceRegistry,
ConnectionUtils,
    /* PROVIDERS SERVICES */

  ],
  exports: [SyncService],
})
export class ScoreCardModule {}

