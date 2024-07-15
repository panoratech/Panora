import { AshbyApplicationInput, AshbyApplicationOutput } from './types';
import {
  UnifiedApplicationInput,
  UnifiedApplicationOutput,
} from '@ats/application/types/model.unified';
import { IApplicationMapper } from '@ats/application/types';
import { MappersRegistry } from '@@core/@core-services/registries/mappers.registry';
import { Injectable } from '@nestjs/common';
import { CoreUnification } from '@@core/@core-services/unification/core-unification.service';
import { Utils } from '@ats/@lib/@utils';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';

@Injectable()
export class AshbyApplicationMapper implements IApplicationMapper {
  constructor(
    private mappersRegistry: MappersRegistry,
    private utils: Utils,
    private coreUnificationService: CoreUnification,
  ) {
    this.mappersRegistry.registerService('ats', 'application', 'ashby', this);
  }

  async desunify(
    source: UnifiedApplicationInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<AshbyApplicationInput> {
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
    source: AshbyApplicationOutput | AshbyApplicationOutput[],
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedApplicationOutput | UnifiedApplicationOutput[]> {
    if (!Array.isArray(source)) {
      return await this.mapSingleApplicationToUnified(
        source,
        connectionId,
        customFieldMappings,
      );
    }
    // Handling array of AshbyApplicationOutput
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
    application: AshbyApplicationOutput,
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedApplicationOutput> {
    return {
      remote_id: application.id,
      remote_data: application,
      applied_at: null,
      rejected_at: application.archivedAt,
      offers: null, // would be synced after and retrieve when user do a GET request
      source: application.source.title || null,
      credited_to:
        (await this.utils.getUserUuidFromRemoteId(
          application.creditedToUser.id,
          connectionId,
        )) || null,
      current_stage:
        (await this.utils.getStageUuidFromRemoteId(
          application.currentInterviewStage.id,
          connectionId,
        )) || null,
      reject_reason:
        (await this.utils.getRejectReasonUuidFromRemoteId(
          application.archiveReason.id,
          connectionId,
        )) || null,
      candidate_id:
        (await this.utils.getCandidateUuidFromRemoteId(
          application.candidate.id,
          connectionId,
        )) || null,
      job_id:
        (await this.utils.getJobUuidFromRemoteId(
          application.job.id,
          connectionId,
        )) || null,
      remote_created_at: application.createdAt,
      remote_modified_at: application.updatedAt,
    };
  }
}
