import { EncryptionService } from '@@core/@core-services/encryption/encryption.service';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
import { ConnectionUtils } from '@@core/connections/@utils';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { Module } from '@nestjs/common';
import { GroupController } from './group.controller';
import { BoxService } from './services/box';
import { GroupService } from './services/group.service';
import { ServiceRegistry } from './services/registry.service';
import { SyncService } from './sync/sync.service';

@Module({
  controllers: [GroupController],
  providers: [
    GroupService,
    LoggerService,
    SyncService,
    WebhookService,
    EncryptionService,
    FieldMappingService,
    ServiceRegistry,
    ConnectionUtils,
    /* PROVIDERS SERVICES */
    BoxService,
  ],
  exports: [SyncService],
})
export class GroupModule {}
