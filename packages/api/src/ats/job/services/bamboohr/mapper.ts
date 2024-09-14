import { BamboohrJobOutput } from './types';
import {
  JobStatus,
  UnifiedAtsJobInput,
  UnifiedAtsJobOutput,
} from '@ats/job/types/model.unified';
import { IJobMapper } from '@ats/job/types';
import { MappersRegistry } from '@@core/@core-services/registries/mappers.registry';
import { Injectable } from '@nestjs/common';
import { CoreUnification } from '@@core/@core-services/unification/core-unification.service';
import { Utils } from '@ats/@lib/@utils';
import { LoggerService } from '@@core/@core-services/logger/logger.service';

@Injectable()
export class BamboohrJobMapper implements IJobMapper {
  constructor(
    private mappersRegistry: MappersRegistry,
    private utils: Utils,
    private coreUnificationService: CoreUnification,
    private logger: LoggerService
  ) {
    this.mappersRegistry.registerService('ats', 'job', 'bamboohr', this);
  }

  async desunify(
    source: UnifiedAtsJobInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<BamboohrJobOutput> {
    return;
  }

  async unify(
    source: BamboohrJobOutput[],
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedAtsJobOutput | UnifiedAtsJobOutput[]> {
    this.logger.log('UNIFY A');

    return Promise.all(
      source.map((job) =>
        this.mapSingleJobToUnified(job, connectionId, customFieldMappings),
      ),
    );
  }

  private async mapSingleJobToUnified(
    job: BamboohrJobOutput,
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedAtsJobOutput> {
    this.logger.log('mapSingleJobToUnified called');
    const field_mappings: { [key: string]: any } = {};
    if (customFieldMappings) {
      for (const mapping of customFieldMappings) {
        field_mappings[mapping.slug] = job[mapping.remote_id];
      }
    }

    let department;
    if (job.department) {
      department = await this.utils.getDepartmentUuidFromRemoteId(
        `${job.department.id}`,
        connectionId,
      );
    }
    let office;
    if (job.location) {
      office = await this.utils.getOfficeUuidFromRemoteId(
        `${job.location.id}`,
        connectionId,
      );
    }

    this.logger.log('mapSingleJobToUnified DONE');

    return {
      remote_id: `${job.id}`,
      remote_data: job,
      name: job.title.label || null,
      description: null,
      code: null,
      status: (job.status.label as JobStatus) || null, //todo
      type: null,
      departments: department ? [department] : null,
      offices: office ? [office] : [],
      managers: [],
      recruiters: [],
      remote_updated_at: null,
      ...field_mappings,
    };
  }
}
