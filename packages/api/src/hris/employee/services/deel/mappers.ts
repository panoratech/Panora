import { Injectable } from '@nestjs/common';
import { MappersRegistry } from '@@core/@core-services/registries/mappers.registry';
import { CoreUnification } from '@@core/@core-services/unification/core-unification.service';
import { IngestDataService } from '@@core/@core-services/unification/ingest-data.service';
import { DeelEmployeeOutput } from './types';
import {
  UnifiedHrisEmployeeInput,
  UnifiedHrisEmployeeOutput,
} from '@hris/employee/types/model.unified';
import { IEmployeeMapper } from '@hris/employee/types';
import { Utils } from '@hris/@lib/@utils';
import { HrisObject } from '@panora/shared';
import { UnifiedHrisEmploymentOutput } from '@hris/employment/types/model.unified';
import { DeelEmploymentOutput } from '@hris/employment/services/deel/types';
import { DeelLocationOutput } from '@hris/location/services/deel/types';
import { UnifiedHrisLocationOutput } from '@hris/location/types/model.unified';

@Injectable()
export class DeelEmployeeMapper implements IEmployeeMapper {
  constructor(
    private mappersRegistry: MappersRegistry,
    private utils: Utils,
    private ingestService: IngestDataService,
    private coreUnificationService: CoreUnification,
  ) {
    this.mappersRegistry.registerService('hris', 'employee', 'deel', this);
  }

  async desunify(
    source: UnifiedHrisEmployeeInput,
    customFieldMappings?: { slug: string; remote_id: string }[],
  ): Promise<any> {
    // Implementation for desunify (if needed)
    return;
  }

  async unify(
    source: DeelEmployeeOutput | DeelEmployeeOutput[],
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
    employee: DeelEmployeeOutput,
    connectionId: string,
    customFieldMappings?: { slug: string; remote_id: string }[],
  ): Promise<UnifiedHrisEmployeeOutput> {
    const opts: any = {};

    if (employee.client_legal_entity) {
      const company_id = await this.utils.getCompanyUuidFromRemoteId(
        employee.client_legal_entity.id, // Assuming client_legal_entity has an id field
        connectionId,
      );
      if (company_id) {
        opts.company_id = company_id;
      }
    }

    if (employee.direct_manager) {
      const manager_id = await this.utils.getEmployeeUuidFromRemoteId(
        employee.direct_manager.id,
        connectionId,
      );
      if (manager_id) {
        opts.manager_id = manager_id;
      }
    }

    if (employee.employments) {
      const employments = await this.ingestService.ingestData<
        UnifiedHrisEmploymentOutput,
        DeelEmploymentOutput
      >(
        employee.employments,
        'deel',
        connectionId,
        'hris',
        HrisObject.employment,
        [],
      );
      if (employments) {
        opts.employments = employments.map((emp) => emp.id_hris_employment);
      }
    }

    if (employee.addresses) {
      const addresses = await this.ingestService.ingestData<
        UnifiedHrisLocationOutput,
        DeelLocationOutput
      >(
        employee.addresses.map((add) => {
          return {
            ...add,
            type: 'HOME',
          };
        }),
        'deel',
        connectionId,
        'hris',
        HrisObject.location,
        [],
      );
      if (addresses) {
        opts.locations = addresses.map((add) => add.id_hris_location);
      }
    }

    const primaryEmployment = employee.employments.find((emp) => !emp.is_ended);

    return {
      remote_id: employee.id,
      remote_data: employee,
      first_name: employee.first_name,
      last_name: employee.last_name,
      preferred_name: null, // Deel doesn't provide this information
      display_full_name: employee.full_name,
      work_email:
        employee.emails.find((email) => email.type === 'work')?.value || null,
      personal_email:
        employee.emails.find((email) => email.type === 'personal')?.value ||
        null,
      mobile_phone_number: null, // Deel doesn't provide this information in the given structure
      start_date: primaryEmployment
        ? new Date(primaryEmployment.start_date)
        : null,
      termination_date: employee.completion_date
        ? new Date(employee.completion_date)
        : null,
      employment_status: this.mapEmploymentStatus(employee.hiring_status),
      date_of_birth: employee.birth_date ? new Date(employee.birth_date) : null,
      avatar_url: null, // Deel doesn't provide this information in the given structure
      gender: null, // Deel doesn't provide this information in the given structure
      ethnicity: null, // Deel doesn't provide this information in the given structure
      marital_status: null, // Deel doesn't provide this information in the given structure
      job_title: primaryEmployment ? primaryEmployment.job_title : null,
      ...opts,
    };
  }

  private mapEmploymentStatus(
    status: string,
  ): 'ACTIVE' | 'PENDING' | 'INACTIVE' {
    switch (status.toUpperCase()) {
      case 'ACTIVE':
        return 'ACTIVE';
      case 'PENDING':
        return 'PENDING';
      default:
        return 'INACTIVE';
    }
  }
}
