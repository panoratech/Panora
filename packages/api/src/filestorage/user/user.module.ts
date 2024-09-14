import { DropboxUserMapper } from './services/dropbox/mappers';
import { DropboxService } from './services/dropbox';
import { SharepointUserMapper } from './services/sharepoint/mappers';
import { SharepointService } from './services/sharepoint';
import { OnedriveUserMapper } from './services/onedrive/mappers';
import { OnedriveService } from './services/onedrive';
import { CoreUnification } from '@@core/@core-services/unification/core-unification.service';
import { IngestDataService } from '@@core/@core-services/unification/ingest-data.service';
import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
import { Utils } from '@filestorage/@lib/@utils';
import { Module } from '@nestjs/common';
import { BoxService } from './services/box';
import { BoxUserMapper } from './services/box/mappers';
import { ServiceRegistry } from './services/registry.service';
import { UserService } from './services/user.service';
import { SyncService } from './sync/sync.service';
import { UserController } from './user.controller';

@Module({
  controllers: [UserController],
  providers: [
    UserService,
    CoreUnification,
    SyncService,
    WebhookService,
    ServiceRegistry,
    IngestDataService,
    BoxUserMapper,
    Utils,
    /* PROVIDERS SERVICES */
    BoxService,
    SharepointService,
    SharepointUserMapper,
    OnedriveService,
    OnedriveUserMapper,
    DropboxService,
    DropboxUserMapper,
  ],
  exports: [SyncService],
})
export class UserModule {}
