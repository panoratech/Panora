import { AshbyInterviewInput, AshbyInterviewOutput } from './types';
import {
  InterviewStatus,
  UnifiedInterviewInput,
  UnifiedInterviewOutput,
} from '@ats/interview/types/model.unified';
import { IInterviewMapper } from '@ats/interview/types';
import { MappersRegistry } from '@@core/@core-services/registries/mappers.registry';
import { Injectable } from '@nestjs/common';
import { CoreUnification } from '@@core/@core-services/unification/core-unification.service';
import { Utils } from '@ats/@lib/@utils';

@Injectable()
export class AshbyInterviewMapper implements IInterviewMapper {
  constructor(
    private mappersRegistry: MappersRegistry,
    private utils: Utils,
    private coreUnificationService: CoreUnification,
  ) {
    this.mappersRegistry.registerService('ats', 'interview', 'ashby', this);
  }

  mapToInterviewStatus(
    data:
      | 'NeedsScheduling'
      | 'WaitingOnCandidateBooking'
      | 'WaitingOnCandidateAvailability'
      | 'CandidateAvailabilitySubmitted'
      | 'Scheduled'
      | 'WaitingOnFeedback'
      | 'Complete'
      | 'Cancelled',
  ): InterviewStatus | string {
    switch (data) {
      case 'Complete':
        return 'COMPLETED';
      case 'WaitingOnFeedback':
        return 'AWAITING_FEEDBACK';
      case 'Scheduled':
        return 'SCHEDULED';
      default:
        return data;
    }
  }

  async desunify(
    source: UnifiedInterviewInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<AshbyInterviewInput> {
    return;
  }

  async unify(
    source: AshbyInterviewOutput | AshbyInterviewOutput[],
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedInterviewOutput | UnifiedInterviewOutput[]> {
    if (!Array.isArray(source)) {
      return await this.mapSingleInterviewToUnified(
        source,
        connectionId,
        customFieldMappings,
      );
    }
    // Handling array of AshbyInterviewOutput
    return Promise.all(
      source.map((interview) =>
        this.mapSingleInterviewToUnified(
          interview,
          connectionId,
          customFieldMappings,
        ),
      ),
    );
  }

  private async mapSingleInterviewToUnified(
    interview: AshbyInterviewOutput,
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedInterviewOutput> {
    let interviewers;
    if (interview.interviewEvents[0].interviewerUserIds) {
      for (const uuid of interview.interviewEvents[0].interviewerUserIds) {
        const person = await this.utils.getUserUuidFromRemoteId(
          uuid,
          connectionId,
        );
        if (person) interviewers.push(person);
      }
    }

    return {
      remote_id: interview.id,
      remote_data: interview,
      status: this.mapToInterviewStatus(interview.status as any) ?? null,
      application_id:
        (await this.utils.getApplicationUuidFromRemoteId(
          interview.applicationId,
          connectionId,
        )) || null,
      job_interview_stage_id:
        (await this.utils.getStageUuidFromRemoteId(
          interview.interviewStageId,
          connectionId,
        )) || null,
      organized_by: null,
      interviewers: interviewers || null,
      location: interview.interviewEvents[0].location || null,
      start_at: interview.interviewEvents[0].startTime || null,
      end_at: interview.interviewEvents[0].endTime || null,
      remote_created_at: interview.interviewEvents[0].createdAt || null,
    };
  }
}
