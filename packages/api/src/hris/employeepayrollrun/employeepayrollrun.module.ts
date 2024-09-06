import { Module } from '@nestjs/common';
import { EmployeePayrollRunController } from './employeepayrollrun.controller';
import { EmployeePayrollRunService } from './services/employeepayrollrun.service';
import { ServiceRegistry } from './services/registry.service';
import { SyncService } from './sync/sync.service';
import { IngestDataService } from '@@core/@core-services/unification/ingest-data.service';
import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
import { CoreUnification } from '@@core/@core-services/unification/core-unification.service';
import { Utils } from '@hris/@lib/@utils';

@Module({
  controllers: [EmployeePayrollRunController],
  providers: [
    EmployeePayrollRunService,
    CoreUnification,
    Utils,
    SyncService,
    WebhookService,
    ServiceRegistry,
    IngestDataService,
    /* PROVIDERS SERVICES */
  ],
  exports: [SyncService],
})
export class EmployeePayrollRunModule {}
