import { EncryptionService } from '@@core/@core-services/encryption/encryption.service';
import { EnvironmentService } from '@@core/@core-services/environment/environment.service';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { Module } from '@nestjs/common';
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
