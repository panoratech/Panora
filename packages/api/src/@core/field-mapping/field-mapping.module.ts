import { EncryptionService } from '@@core/@core-services/encryption/encryption.service';
import { Module } from '@nestjs/common';
import { LoggerService } from '../@core-services/logger/logger.service';
import { FieldMappingController } from './field-mapping.controller';
import { FieldMappingService } from './field-mapping.service';

@Module({
  providers: [FieldMappingService],
  controllers: [FieldMappingController],
})
export class FieldMappingModule {}
