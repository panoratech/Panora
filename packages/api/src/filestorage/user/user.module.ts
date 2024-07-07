import { EncryptionService } from '@@core/@core-services/encryption/encryption.service';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
import { ConnectionUtils } from '@@core/connections/@utils';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { Module } from '@nestjs/common';
import { BoxService } from './services/box';
import { ServiceRegistry } from './services/registry.service';
import { UserService } from './services/user.service';
import { SyncService } from './sync/sync.service';
import { UserController } from './user.controller';
import { IngestDataService } from '@@core/@core-services/unification/ingest-data.service';

@Module({
  controllers: [UserController],
  providers: [
    UserService,
    LoggerService,
    SyncService,
    WebhookService,
    EncryptionService,
    FieldMappingService,
    ServiceRegistry,
    ConnectionUtils,
    IngestDataService,
    /* PROVIDERS SERVICES */
    BoxService,
  ],
  exports: [SyncService],
})
export class UserModule {}