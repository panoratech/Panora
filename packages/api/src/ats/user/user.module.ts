import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
import { Module } from '@nestjs/common';
import { ServiceRegistry } from './services/registry.service';
import { UserService } from './services/user.service';
import { SyncService } from './sync/sync.service';
import { UserController } from './user.controller';
import { IngestDataService } from '@@core/@core-services/unification/ingest-data.service';
import { AshbyService } from './services/ashby';
import { AshbyUserMapper } from './services/ashby/mappers';
import { Utils } from '@ats/@lib/@utils';
import { BamboohrService } from './services/bamboohr';
import { BamboohrUserMapper } from './services/bamboohr/mappers';

@Module({
  controllers: [UserController],
  providers: [
    UserService,

    SyncService,
    WebhookService,

    ServiceRegistry,

    IngestDataService,
    Utils,

    AshbyUserMapper,
    /* PROVIDERS SERVICES */
    AshbyService,
    BamboohrService,
    BamboohrUserMapper,
  ],
  exports: [SyncService],
})
export class UserModule {}
