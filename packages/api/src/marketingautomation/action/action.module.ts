import { Module } from '@nestjs/common';
import { ActionController } from './action.controller';
import { SyncService } from './sync/sync.service';
import { LoggerService } from '@@core/logger/logger.service';
import { ActionService } from './services/action.service';
import { ServiceRegistry } from './services/registry.service';
import { EncryptionService } from '@@core/encryption/encryption.service';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { PrismaService } from '@@core/prisma/prisma.service';
import { WebhookService } from '@@core/webhook/webhook.service';
import { BullModule } from '@nestjs/bull';
import { ConnectionUtils } from '@@core/connections/@utils';
import { CoreModule } from '@@core/core.module';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'webhookDelivery',
    }),
    CoreModule,
  ],
  controllers: [ActionController],
  providers: [
    ActionService,
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
  exports: [SyncService, CoreModule],
})
export class ActionModule {}
