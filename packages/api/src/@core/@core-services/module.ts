import { RagModule } from '@@core/rag/rag.module';
import { Global, Module } from '@nestjs/common';
import { ConnectionUtils } from '../connections/@utils/index';
import { FieldMappingService } from './../field-mapping/field-mapping.service';
import { EncryptionService } from './encryption/encryption.service';
import { LoggerService } from './logger/logger.service';
import { PrismaService } from './prisma/prisma.service';
import { BullQueueModule } from './queues/queue.module';
import { CategoryConnectionRegistry } from './registries/connections-categories.registry';
import { CoreSyncRegistry } from './registries/core-sync.registry';
import { MappersRegistry } from './registries/mappers.registry';
import { UnificationRegistry } from './registries/unification.registry';
import { RetryModule } from './request-retry/module';
import { CoreUnification } from './unification/core-unification.service';
import { RagService } from '@@core/rag/rag.service';

@Global()
@Module({
  imports: [BullQueueModule, RetryModule, RagModule],
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
    RagService,
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
    BullQueueModule,
    RetryModule,
    RagService,
  ],
})
export class CoreSharedModule {}
