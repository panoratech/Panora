import { MappersRegistry } from '@@core/@core-services/registries/mappers.registry';
import { CoreUnification } from '@@core/@core-services/unification/core-unification.service';
import { IngestDataService } from '@@core/@core-services/unification/ingest-data.service';
import { Utils } from '@hris/@lib/@utils';
import { IEmployeeMapper } from '@hris/employee/types';
import {
  EmploymentStatus,
  Gender,
  MartialStatus,
  UnifiedHrisEmployeeInput,
  UnifiedHrisEmployeeOutput,
} from '@hris/employee/types/model.unified';
import { Injectable } from '@nestjs/common';
import { SageEmployeeOutput } from './types';

@Injectable()
export class SageEmployeeMapper implements IEmployeeMapper {
  constructor(
    private mappersRegistry: MappersRegistry,
    private utils: Utils,
    private ingestService: IngestDataService,
    private coreUnificationService: CoreUnification,
  ) {
    this.mappersRegistry.registerService('hris', 'employee', 'sage', this);
  }

  async desunify(
    source: UnifiedHrisEmployeeInput,
    customFieldMappings?: { slug: string; remote_id: string }[],
  ): Promise<any> {
    // Implementation for desunify (if needed)
    return;
  }

  async unify(
    source: SageEmployeeOutput | SageEmployeeOutput[],
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
    employee: SageEmployeeOutput,
    connectionId: string,
    customFieldMappings?: { slug: string; remote_id: string }[],
  ): Promise<UnifiedHrisEmployeeOutput> {
    return {
      remote_id: employee.id.toString(),
      remote_data: employee,
      first_name: employee.first_name,
      last_name: employee.last_name,
      display_full_name: `${employee.first_name} ${employee.last_name}`,
      work_email: employee.email,
      mobile_phone_number: employee.mobile_phone,
      employments: [], // We would need to process employment history to populate this
      groups: [employee.team],
      start_date: new Date(employee.employment_start_date),
      employment_status: this.mapEmploymentStatus(employee.employment_status),
      date_of_birth: new Date(employee.date_of_birth),
      gender: this.mapGender(employee.gender),
      marital_status: this.mapMaritalStatus(employee.marital_status),
      avatar_url: employee.picture_url,
      ssn: employee.personal_identification_number,
      employee_number: employee.employee_number,
    };
  }

  private mapGender(sageGender: string): Gender {
    switch (sageGender.toLowerCase()) {
      case 'male':
        return 'MALE';
      case 'female':
        return 'FEMALE';
      default:
        return 'OTHER';
    }
  }

  private mapMaritalStatus(sageMaritalStatus: string): MartialStatus {
    switch (sageMaritalStatus.toLowerCase()) {
      case 'married':
        return 'MARRIED_FILING_JOINTLY';
      case 'single':
        return 'SINGLE';
      default:
        return 'SINGLE'; // Default to single if unknown
    }
  }

  private mapEmploymentStatus(sageEmploymentStatus: string): EmploymentStatus {
    switch (sageEmploymentStatus.toLowerCase()) {
      case 'full-time':
      case 'part-time':
        return 'ACTIVE';
      default:
        return 'INACTIVE';
    }
  }
}
