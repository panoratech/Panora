import { Global, Module } from '@nestjs/common';
import { MappersRegistry } from './registries/mappers.registry';
import { UnificationRegistry } from './registries/unification.registry';
import { CoreSyncRegistry } from './registries/core-sync.registry';
import { EncryptionService } from './encryption/encryption.service';
import { CoreUnification } from './unification/core-unification.service';
import { LoggerService } from './logger/logger.service';
import { ConnectionUtils } from '../connections/@utils/index';
import { CategoryConnectionRegistry } from './registries/connections-categories.registry';
import { PrismaService } from './prisma/prisma.service';
import { FieldMappingService } from './../field-mapping/field-mapping.service';

@Global()
@Module({
  providers: [
    PrismaService,
    MappersRegistry,
    UnificationRegistry,
    CoreSyncRegistry,
    EncryptionService,
    CategoryConnectionRegistry,
    CoreUnification,
    LoggerService,
    ConnectionUtils,
    FieldMappingService,
  ],
  exports: [
    PrismaService,
    MappersRegistry,
    UnificationRegistry,
    CoreSyncRegistry,
    EncryptionService,
    CategoryConnectionRegistry,
    CoreUnification,
    LoggerService,
    ConnectionUtils,
    FieldMappingService,
  ],
})
export class CoreSharedModule {}
