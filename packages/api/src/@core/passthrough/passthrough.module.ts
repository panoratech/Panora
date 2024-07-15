import { EncryptionService } from '@@core/@core-services/encryption/encryption.service';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { Module } from '@nestjs/common';
import { PassthroughController } from './passthrough.controller';
import { PassthroughService } from './passthrough.service';

@Module({
  providers: [PassthroughService, EncryptionService],
  controllers: [PassthroughController],
})
export class PassthroughModule {}
