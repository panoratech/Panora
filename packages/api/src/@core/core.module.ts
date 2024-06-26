import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { ConnectionsModule } from './connections/connections.module';
import { LinkedUsersModule } from './linked-users/linked-users.module';
import { OrganisationsModule } from './organisations/organisations.module';
import { ProjectsModule } from './projects/projects.module';
import { FieldMappingModule } from './field-mapping/field-mapping.module';
import { EventsModule } from './events/events.module';
import { MagicLinkModule } from './magic-link/magic-link.module';
import { PassthroughModule } from './passthrough/passthrough.module';
import { EnvironmentModule } from './@core-services/environment/environment.module';
import { EncryptionService } from './@core-services/encryption/encryption.service';
import { ConnectionsStrategiesModule } from './connections-strategies/connections-strategies.module';
import { SyncModule } from './sync/sync.module';
import { ProjectConnectorsModule } from './project-connectors/project-connectors.module';
import { LoggerService } from './@core-services/logger/logger.service';
import { MappersRegistry } from './@core-services/registries/mappers.registry';
import { UnificationRegistry } from './@core-services/registries/unification.registry';
import { CoreUnification } from './@core-services/unification/core-unification.service';
import { CoreSyncRegistry } from './@core-services/registries/core-sync.registry';
import { BullQueueModule } from './@core-services/queues/queue.module';
import { WebhookModule } from './@core-services/webhooks/panora-webhooks/webhook.module';
import { ManagedWebhooksModule } from './@core-services/webhooks/third-parties-webhooks/managed-webhooks.module';
import { CategoryConnectionRegistry } from './@core-services/registries/connections-categories.registry';

@Module({
  imports: [
    AuthModule,
    ConnectionsModule,
    LinkedUsersModule,
    OrganisationsModule,
    ProjectsModule,
    FieldMappingModule,
    EventsModule,
    MagicLinkModule,
    PassthroughModule,
    WebhookModule,
    ManagedWebhooksModule,
    EnvironmentModule,
    ConnectionsStrategiesModule,
    SyncModule,
    ProjectConnectorsModule,
    BullQueueModule,
  ],
  exports: [
    AuthModule,
    ConnectionsModule,
    LinkedUsersModule,
    OrganisationsModule,
    ProjectsModule,
    FieldMappingModule,
    EventsModule,
    MagicLinkModule,
    PassthroughModule,
    WebhookModule,
    ManagedWebhooksModule,
    EnvironmentModule,
    ConnectionsStrategiesModule,
    SyncModule,
    ProjectConnectorsModule,
    MappersRegistry,
    UnificationRegistry,
    CoreUnification,
    CoreSyncRegistry,
    BullQueueModule,
  ],
  providers: [
    EncryptionService,
    LoggerService,
    MappersRegistry,
    UnificationRegistry,
    CoreUnification,
    CoreSyncRegistry,
    CategoryConnectionRegistry,
  ],
})
export class CoreModule {}
