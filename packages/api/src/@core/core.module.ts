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
import { WebhookModule } from './webhook/webhook.module';
import { EnvironmentModule } from './environment/environment.module';
import { EncryptionService } from './encryption/encryption.service';
import { ConnectionsStrategiesModule } from './connections-strategies/connections-strategies.module';

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
    EnvironmentModule,
    ConnectionsStrategiesModule,
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
    EnvironmentModule,
    ConnectionsStrategiesModule,
  ],
  providers: [EncryptionService],
})
export class CoreModule {}
