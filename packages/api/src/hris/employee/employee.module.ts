import { Module } from '@nestjs/common';
import { EmployeeController } from './employee.controller';
import { EmployeeService } from './services/employee.service';
import { ServiceRegistry } from './services/registry.service';
import { SyncService } from './sync/sync.service';
import { IngestDataService } from '@@core/@core-services/unification/ingest-data.service';
import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
import { CoreUnification } from '@@core/@core-services/unification/core-unification.service';
import { GustoEmployeeMapper } from './services/gusto/mappers';
import { GustoService } from './services/gusto';
import { Utils } from '@hris/@lib/@utils';
@Module({
  controllers: [EmployeeController],
  providers: [
    EmployeeService,
    CoreUnification,
    SyncService,
    Utils,
    WebhookService,
    ServiceRegistry,
    IngestDataService,
    GustoEmployeeMapper,
    /* PROVIDERS SERVICES */
    GustoService,
  ],
  exports: [SyncService],
})
export class EmployeeModule {}
