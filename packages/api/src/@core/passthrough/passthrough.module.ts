import { EncryptionService } from '@@core/@core-services/encryption/encryption.service';
import { Module } from '@nestjs/common';
import { PassthroughController } from './passthrough.controller';
import { PassthroughService } from './passthrough.service';
import { ConnectionUtils } from '@@core/connections/@utils';

@Module({
  providers: [PassthroughService, EncryptionService, ConnectionUtils],
  controllers: [PassthroughController],
})
export class PassthroughModule {}
