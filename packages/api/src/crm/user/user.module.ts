import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { SyncService } from './sync/sync.service';
import { LoggerService } from '@@core/logger/logger.service';
import { UserService } from './services/user.service';
import { ServiceRegistry } from './services/registry.service';
import { EncryptionService } from '@@core/encryption/encryption.service';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { PrismaService } from '@@core/prisma/prisma.service';
import { WebhookService } from '@@core/webhook/webhook.service';
import { BullModule } from '@nestjs/bull';
import { ConnectionUtils } from '@@core/connections/@utils';
import { HubspotService } from './services/hubspot';
import { PipedriveService } from './services/pipedrive';
import { ZendeskService } from './services/zendesk';
import { ZohoService } from './services/zoho';
import { CloseService } from './services/close';
import { MappersRegistry } from '@@core/utils/registry/mappings.registry';
import { UnificationRegistry } from '@@core/utils/registry/unification.registry';
import { CoreUnification } from '@@core/utils/services/core.service';
import { Utils } from '@crm/@lib/@utils';

@Module({
  imports: [
    BullModule.registerQueue(
      {
        name: 'webhookDelivery',
      },
      { name: 'syncTasks' },
    ),
  ],
  controllers: [UserController],
  providers: [
    UserService,
    PrismaService,
    LoggerService,
    SyncService,
    WebhookService,
    EncryptionService,
    FieldMappingService,
    ServiceRegistry,
ConnectionUtils,
    CoreUnification,
    UnificationRegistry,
    MappersRegistry,
    Utils,
    /* PROVIDERS SERVICES */
    ZendeskService,
    ZohoService,
    PipedriveService,
    HubspotService,
    CloseService,
  ],
  exports: [
    SyncService,
    ServiceRegistry,
    WebhookService,
    FieldMappingService,
    LoggerService,
    PrismaService,
  ],
})
export class UserModule {}
