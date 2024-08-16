import { Module } from '@nestjs/common';
import { LocationController } from './location.controller';
import { LocationService } from './services/location.service';
import { ServiceRegistry } from './services/registry.service';
import { SyncService } from './sync/sync.service';
import { IngestDataService } from '@@core/@core-services/unification/ingest-data.service';
import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
import { CoreUnification } from '@@core/@core-services/unification/core-unification.service';
import { Utils } from '@hris/@lib/@utils';
import { GustoLocationMapper } from './services/gusto/mappers';
import { GustoService } from './services/gusto';
import { DeelLocationMapper } from './services/deel/mappers';
@Module({
  controllers: [LocationController],
  providers: [
    LocationService,
    CoreUnification,
    Utils,
    SyncService,
    WebhookService,
    ServiceRegistry,
    IngestDataService,
    GustoLocationMapper,
    DeelLocationMapper,
    /* PROVIDERS SERVICES */
    GustoService,
  ],
  exports: [SyncService],
})
export class LocationModule {}
