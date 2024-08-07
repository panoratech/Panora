import {
  GreenhouseApplicationInput,
  GreenhouseApplicationOutput,
} from './types';
import {
  UnifiedAtsApplicationInput,
  UnifiedAtsApplicationOutput,
} from '@ats/application/types/model.unified';
import { IApplicationMapper } from '@ats/application/types';
import { MappersRegistry } from '@@core/@core-services/registries/mappers.registry';
import { Injectable } from '@nestjs/common';
import { CoreUnification } from '@@core/@core-services/unification/core-unification.service';
import { Utils } from '@ats/@lib/@utils';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';

@Injectable()
export class GreenhouseApplicationMapper implements IApplicationMapper {
  constructor(
    private mappersRegistry: MappersRegistry,
    private utils: Utils,
    private coreUnificationService: CoreUnification,
  ) {
    this.mappersRegistry.registerService(
      'ats',
      'application',
      'greenhouse',
      this,
    );
  }

  async desunify(
    source: UnifiedAtsApplicationInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<GreenhouseApplicationInput> {
    if (!source.candidate_id)
      throw new ReferenceError(
        'You must provide a candidate id to insert an application',
      );
    if (!source.job_id)
      throw new ReferenceError(
        'You must provide a job id to insert an application',
      );

    const candidateId = await this.utils.getCandidateRemoteIdFromUuid(
      source.candidate_id,
    );
    const jobId = await this.utils.getJobRemoteIdFromUuid(source.job_id);
    const res: any = {
      canidateId: candidateId,
      jobId: jobId,
    };
    if (source.credited_to) {
      res.creditedToUserId = await this.utils.getUserRemoteIdFromUuid(
        source.credited_to,
      );
    }
    if (source.current_stage) {
      res.interviewStageId = await this.utils.getInterviewStageRemoteIdFromUuid(
        source.current_stage,
      );
    }

    return res;
  }

  async unify(
    source: GreenhouseApplicationOutput | GreenhouseApplicationOutput[],
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedAtsApplicationOutput | UnifiedAtsApplicationOutput[]> {
    if (!Array.isArray(source)) {
      return await this.mapSingleApplicationToUnified(
        source,
        connectionId,
        customFieldMappings,
      );
    }
    // Handling array of GreenhouseApplicationOutput
    return Promise.all(
      source.map((application) =>
        this.mapSingleApplicationToUnified(
          application,
          connectionId,
          customFieldMappings,
        ),
      ),
    );
  }

  private async mapSingleApplicationToUnified(
    application: GreenhouseApplicationOutput,
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedAtsApplicationOutput> {
    return {
      remote_id: String(application.id),
      remote_data: application,
      applied_at: String(application.applied_at),
      rejected_at: application.rejected_at,
      offers: null, // would be synced after and retrieve when user do a GET request
      source: application.source.public_name || null,
      credited_to:
        (await this.utils.getUserUuidFromRemoteId(
          String(application.credited_to.id),
          connectionId,
        )) || null,
      current_stage:
        (await this.utils.getStageUuidFromRemoteId(
          String(application.current_stage.id),
          connectionId,
        )) || null,
      reject_reason:
        (await this.utils.getRejectReasonUuidFromRemoteId(
          String(application.rejection_reason.id),
          connectionId,
        )) || null,
      candidate_id:
        (await this.utils.getCandidateUuidFromRemoteId(
          String(application.candidate_id),
          connectionId,
        )) || null,
      job_id:
        (await this.utils.getJobUuidFromRemoteId(
          String(application.jobs[0].id),
          connectionId,
        )) || null,
      remote_created_at: null,
      remote_modified_at: String(application.last_activity_at) || null,
    };
  }
}
