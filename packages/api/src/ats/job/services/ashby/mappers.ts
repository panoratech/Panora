import { AshbyJobInput, AshbyJobOutput } from './types';
import {
  JobStatus,
  UnifiedJobInput,
  UnifiedJobOutput,
} from '@ats/job/types/model.unified';
import { IJobMapper } from '@ats/job/types';
import { MappersRegistry } from '@@core/@core-services/registries/mappers.registry';
import { Injectable } from '@nestjs/common';
import { CoreUnification } from '@@core/@core-services/unification/core-unification.service';
import { Utils } from '@ats/@lib/@utils';

@Injectable()
export class AshbyJobMapper implements IJobMapper {
  constructor(
    private mappersRegistry: MappersRegistry,
    private utils: Utils,
    private coreUnificationService: CoreUnification,
  ) {
    this.mappersRegistry.registerService('ats', 'job', 'ashby', this);
  }

  async desunify(
    source: UnifiedJobInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<AshbyJobInput> {
    return;
  }

  async unify(
    source: AshbyJobOutput | AshbyJobOutput[],
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedJobOutput | UnifiedJobOutput[]> {
    if (!Array.isArray(source)) {
      return await this.mapSingleJobToUnified(
        source,
        connectionId,
        customFieldMappings,
      );
    }
    // Handling array of AshbyJobOutput
    return Promise.all(
      source.map((job) =>
        this.mapSingleJobToUnified(job, connectionId, customFieldMappings),
      ),
    );
  }

  private async mapSingleJobToUnified(
    job: AshbyJobOutput,
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedJobOutput> {
    let department;
    if (job.departmentId) {
      department = await this.utils.getDepartmentUuidFromRemoteId(
        job.departmentId,
        connectionId,
      );
    }
    let office;
    if (job.locationId) {
      office = await this.utils.getOfficeUuidFromRemoteId(
        job.locationId,
        connectionId,
      );
    }
    let recruiters;
    if (job.hiringTeam) {
      for (const ht of job.hiringTeam) {
        const r = await this.utils.getUserUuidFromRemoteId(
          ht.userId,
          connectionId,
        );
        if (r) recruiters.push(r);
      }
    }

    return {
      remote_id: job.id,
      remote_data: job,
      name: job.title || null,
      description: null,
      code: null,
      status: (job.status as JobStatus) || null, //todo
      type: null,
      confidential: job.confidential || null,
      departments: department ? [department] : null,
      offices: office ? [office] : null,
      managers: null,
      recruiters: recruiters || null,
      remote_updated_at: job.updatedAt || null,
    };
  }
}
