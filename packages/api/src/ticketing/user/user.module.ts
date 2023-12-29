import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { BullModule } from '@nestjs/bull';
import { UserService } from './services/user.service';
import { UserServiceRegistry } from './services/registry.service';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { WebhookService } from '@@core/webhook/webhook.service';
import { EncryptionService } from '@@core/encryption/encryption.service';
import { PrismaService } from '@@core/prisma/prisma.service';
import { ZendeskUserService } from './services/zendesk';
import { LoggerService } from '@@core/logger/logger.service';
import { SyncUsersService } from './sync/sync.service';

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
    ZendeskUserService,
    LoggerService,
    SyncUsersService,
    WebhookService,
    EncryptionService,
    FieldMappingService,
    UserServiceRegistry,
  ],
  exports: [SyncUsersService],
})
export class UserModule {}
