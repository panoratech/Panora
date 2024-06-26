import { Module } from '@nestjs/common';
import { BenefitController } from './benefit.controller';
import { SyncService } from './sync/sync.service';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { BenefitService } from './services/benefit.service';
import { ServiceRegistry } from './services/registry.service';
import { EncryptionService } from '@@core/@core-services/encryption/encryption.service';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
import { BullModule } from '@nestjs/bull';
import { ConnectionUtils } from '@@core/connections/@utils';
import { ApiKeyAuthGuard } from '@@core/auth/guards/api-key.guard';

@Module({
  
  controllers: [BenefitController],
  providers: [
    BenefitService,LoggerService,
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
export class BenefitModule {}
