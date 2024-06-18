import { LoggerService } from '@@core/logger/logger.service';
import { PrismaService } from '@@core/prisma/prisma.service';
import { Module } from '@nestjs/common';
import { EnvironmentService } from '@@core/environment/environment.service';
import { EncryptionService } from '@@core/encryption/encryption.service';
import { CrmWebhookHandlerService } from './handler.service';

@Module({
  imports: [],
  providers: [
    LoggerService,
    EncryptionService,
    EnvironmentService,
    CrmWebhookHandlerService,
    /* PROVIDERS SERVICES */
  ],
  exports: [LoggerService, CrmWebhookHandlerService],
})
export class CrmWebhookHandlerModule {}
