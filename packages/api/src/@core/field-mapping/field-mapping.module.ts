import { Module } from '@nestjs/common';
import { FieldMappingService } from './field-mapping.service';
import { FieldMappingController } from './field-mapping.controller';
import { PrismaService } from '../prisma/prisma.service';
import { LoggerService } from '../logger/logger.service';
import { EncryptionService } from '@@core/encryption/encryption.service';

@Module({
  providers: [
    FieldMappingService,
    PrismaService,
    LoggerService,
    EncryptionService,
  ],
  controllers: [FieldMappingController],
})
export class FieldMappingModule {}
