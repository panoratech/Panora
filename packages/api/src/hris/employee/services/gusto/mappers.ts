import { MappersRegistry } from '@@core/@core-services/registries/mappers.registry';
import { CoreUnification } from '@@core/@core-services/unification/core-unification.service';
import { IngestDataService } from '@@core/@core-services/unification/ingest-data.service';
import { Injectable } from '@nestjs/common';
import { GustoEmployeeOutput } from './types';
import {
  UnifiedHrisEmployeeInput,
  UnifiedHrisEmployeeOutput,
} from '@hris/employee/types/model.unified';
import { IEmployeeMapper } from '@hris/employee/types';
import { Utils } from '@hris/@lib/@utils';
import { Job } from 'bull';
import { HrisObject, TicketingObject } from '@panora/shared';
import { ZendeskTagOutput } from '@ticketing/tag/services/zendesk/types';
import axios from 'axios';
import { UnifiedHrisLocationOutput } from '@hris/location/types/model.unified';
import { UnifiedHrisEmploymentOutput } from '@hris/employment/types/model.unified';
import { GustoEmploymentOutput } from '@hris/employment/services/gusto/types';

@Injectable()
export class GustoEmployeeMapper implements IEmployeeMapper {
  constructor(
    private mappersRegistry: MappersRegistry,
    private utils: Utils,
    private ingestService: IngestDataService,
    private coreUnificationService: CoreUnification,
  ) {
    this.mappersRegistry.registerService('hris', 'employee', 'gusto', this);
  }

  async desunify(
    source: UnifiedHrisEmployeeInput,
    customFieldMappings?: { slug: string; remote_id: string }[],
  ): Promise<any> {
    return;
  }

  async unify(
    source: GustoEmployeeOutput | GustoEmployeeOutput[],
    connectionId: string,
    customFieldMappings?: { slug: string; remote_id: string }[],
  ): Promise<UnifiedHrisEmployeeOutput | UnifiedHrisEmployeeOutput[]> {
    if (!Array.isArray(source)) {
      return this.mapSingleEmployeeToUnified(
        source,
        connectionId,
        customFieldMappings,
      );
    }
    return Promise.all(
      source.map((employee) =>
        this.mapSingleEmployeeToUnified(
          employee,
          connectionId,
          customFieldMappings,
        ),
      ),
    );
  }

  private async mapSingleEmployeeToUnified(
    employee: GustoEmployeeOutput,
    connectionId: string,
    customFieldMappings?: { slug: string; remote_id: string }[],
  ): Promise<UnifiedHrisEmployeeOutput> {
    const opts: any = {};
    if (employee.company_uuid) {
      const company_id = await this.utils.getCompanyUuidFromRemoteId(
        employee.company_uuid,
        connectionId,
      );
      if (company_id) {
        opts.company_id = company_id;
      }
    }
    if (employee.manager_uuid) {
      const manager_id = await this.utils.getEmployeeUuidFromRemoteId(
        employee.manager_uuid,
        connectionId,
      );
      if (manager_id) {
        opts.manager_id = manager_id;
      }
    }

    if (employee.jobs) {
      const compensationObjects = employee.jobs.map((job) => {
        const compensation =
          job.compensations.find(
            (compensation) =>
              compensation.uuid === job.current_compensation_uuid,
          ) || null;

        return {
          ...compensation,
          title: job.title,
        };
      });
      const employments = await this.ingestService.ingestData<
        UnifiedHrisEmploymentOutput,
        GustoEmploymentOutput
      >(
        compensationObjects,
        'gusto',
        connectionId,
        'hris',
        HrisObject.employment,
        [],
      );
      if (employments) {
        opts.employments = employments.map((emp) => emp.id_hris_employment);
      }
    }

    const primaryJob = employee.jobs.find((job) => job.primary);

    return {
      remote_id: employee.uuid,
      remote_data: employee,
      first_name: employee.first_name,
      last_name: employee.last_name,
      preferred_name: employee.preferred_first_name,
      display_full_name: `${employee.first_name} ${employee.last_name}`,
      work_email: employee.work_email,
      personal_email: employee.email,
      mobile_phone_number: employee.phone,
      start_date: primaryJob ? new Date(primaryJob.hire_date) : null,
      termination_date:
        employee.terminations.length > 0
          ? new Date(employee.terminations[0].effective_date)
          : null,
      employment_status: employee.current_employment_status,
      date_of_birth: employee.date_of_birth
        ? new Date(employee.date_of_birth)
        : null,
      ...opts,
    };
  }
}
