import { Module } from '@nestjs/common';
import { CompanyController } from './company.controller';
import { CompanyService } from './services/company.service';
import { ServiceRegistry } from './services/registry.service';
import { SyncService } from './sync/sync.service';
import { IngestDataService } from '@@core/@core-services/unification/ingest-data.service';
import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
import { CoreUnification } from '@@core/@core-services/unification/core-unification.service';
import { GustoCompanyMapper } from './services/gusto/mappers';
import { GustoService } from './services/gusto';

@Module({
  controllers: [CompanyController],
  providers: [
    CompanyService,
    CoreUnification,
    SyncService,
    WebhookService,
    ServiceRegistry,
    IngestDataService,
    GustoCompanyMapper,
    /* PROVIDERS SERVICES */
    GustoService,
  ],
  exports: [SyncService],
})
export class CompanyModule {}
