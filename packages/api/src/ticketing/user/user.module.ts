import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { BullModule } from '@nestjs/bull';
import { UserService } from './services/user.service';
import { ServiceRegistry } from './services/registry.service';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { WebhookService } from '@@core/webhook/webhook.service';
import { EncryptionService } from '@@core/encryption/encryption.service';
import { PrismaService } from '@@core/prisma/prisma.service';
import { ZendeskService } from './services/zendesk';
import { LoggerService } from '@@core/logger/logger.service';
import { SyncService } from './sync/sync.service';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'webhookDelivery',
    }),
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
    //PROVIDERS SERVICES
    ZendeskService,
  ],
  exports: [SyncService],
})
export class UserModule {}
