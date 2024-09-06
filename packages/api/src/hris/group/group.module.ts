import { Module } from '@nestjs/common';
import { GroupController } from './group.controller';
import { GroupService } from './services/group.service';
import { ServiceRegistry } from './services/registry.service';
import { SyncService } from './sync/sync.service';
import { IngestDataService } from '@@core/@core-services/unification/ingest-data.service';
import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
import { CoreUnification } from '@@core/@core-services/unification/core-unification.service';
import { GustoGroupMapper } from './services/gusto/mappers';
import { GustoService } from './services/gusto';
import { Utils } from '@hris/@lib/@utils';
import { SageService } from './services/sage';
import { SageGroupMapper } from './services/sage/mappers';
import { DeelService } from './services/deel';
import { DeelGroupMapper } from './services/deel/mappers';
@Module({
  controllers: [GroupController],
  providers: [
    GroupService,
    SyncService,
    WebhookService,
    CoreUnification,
    ServiceRegistry,
    IngestDataService,
    GustoGroupMapper,
    Utils,
    SageGroupMapper,
    DeelGroupMapper,
    /* PROVIDERS SERVICES */
    GustoService,
    SageService,
    DeelService,
  ],
  exports: [SyncService],
})
export class GroupModule {}
