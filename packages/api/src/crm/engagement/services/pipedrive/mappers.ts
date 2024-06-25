import { PipedriveEngagementInput, PipedriveEngagementOutput } from './types';
import {
  UnifiedEngagementInput,
  UnifiedEngagementOutput,
} from '@crm/engagement/types/model.unified';
import { IEngagementMapper } from '@crm/engagement/types';
import { Utils } from '@crm/@lib/@utils';
import { MappersRegistry } from '@@core/utils/registry/mappings.registry';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PipedriveEngagementMapper implements IEngagementMapper {
  constructor(private mappersRegistry: MappersRegistry, private utils: Utils) {
    this.mappersRegistry.registerService(
      'crm',
      'engagement',
      'pipedrive',
      this,
    );
  }

  //TODO:
  desunify(
    source: UnifiedEngagementInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): PipedriveEngagementInput {
    return;
  }

  async unify(
    source: PipedriveEngagementOutput | PipedriveEngagementOutput[],
    engagement_type: string,
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedEngagementOutput | UnifiedEngagementOutput[]> {
    switch (engagement_type) {
      case 'CALL':
        return await this.unifyCall(source, connectionId, customFieldMappings);
      case 'MEETING':
        return await this.unifyMeeting(
          source,
          connectionId,
          customFieldMappings,
        );
      case 'EMAIL':
        return await this.unifyEmail(source, connectionId, customFieldMappings);
      default:
        break;
    }
  }

  private async unifyCall(
    source: PipedriveEngagementOutput | PipedriveEngagementOutput[],
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ) {
    if (!Array.isArray(source)) {
      return this.mapSingleEngagementCallToUnified(
        source,
        connectionId,
        customFieldMappings,
      );
    }
    // Handling array of PipedriveEngagementOutput
    return Promise.all(
      source.map((engagement) =>
        this.mapSingleEngagementCallToUnified(
          engagement,
          connectionId,
          customFieldMappings,
        ),
      ),
    );
  }

  private async unifyMeeting(
    source: PipedriveEngagementOutput | PipedriveEngagementOutput[],
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ) {
    if (!Array.isArray(source)) {
      return this.mapSingleEngagementMeetingToUnified(
        source,
        connectionId,
        customFieldMappings,
      );
    }
    // Handling array of PipedriveEngagementOutput
    return Promise.all(
      source.map((engagement) =>
        this.mapSingleEngagementMeetingToUnified(
          engagement,
          connectionId,
          customFieldMappings,
        ),
      ),
    );
  }

  private async unifyEmail(
    source: PipedriveEngagementOutput | PipedriveEngagementOutput[],
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ) {
    if (!Array.isArray(source)) {
      return this.mapSingleEngagementEmailToUnified(
        source,
        connectionId,
        customFieldMappings,
      );
    }
    // Handling array of PipedriveEngagementOutput
    return Promise.all(
      source.map((engagement) =>
        this.mapSingleEngagementEmailToUnified(
          engagement,
          connectionId,
          customFieldMappings,
        ),
      ),
    );
  }

  private async mapSingleEngagementCallToUnified(
    engagement: PipedriveEngagementOutput,
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedEngagementOutput> {
    const field_mappings: { [key: string]: any } = {};
    if (customFieldMappings) {
      for (const mapping of customFieldMappings) {
        field_mappings[mapping.slug] = engagement[mapping.remote_id];
      }
    }

    const opts: any = {};
    if (engagement.user_id) {
      const owner_id = await this.utils.getUserUuidFromRemoteId(
        String(engagement.user_id),
        connectionId,
      );
      if (owner_id) {
        opts.user_id = owner_id;
      }
    }

    return {
      content: engagement.public_description,
      subject: engagement.subject,
      start_at: new Date(engagement.due_date + ' ' + engagement.due_time), // Combine due_date and due_time
      end_time: new Date(engagement.marked_as_done_time),
      type: 'CALL',
      field_mappings,
      ...opts,
      /*TODO: company_id: engagement.company_id
        ? String(engagement.company_id)
        : undefined,*/
      //contacts: engagement.participants.map((p) => String(p.person_id)), // Assuming participants are contacts
    };
  }

  private async mapSingleEngagementMeetingToUnified(
    engagement: PipedriveEngagementOutput,
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedEngagementOutput> {
    const field_mappings: { [key: string]: any } = {};
    if (customFieldMappings) {
      for (const mapping of customFieldMappings) {
        field_mappings[mapping.slug] = engagement[mapping.remote_id];
      }
    }

    let opts: any = {};
    if (engagement.user_id) {
      const owner_id = await this.utils.getUserUuidFromRemoteId(
        String(engagement.user_id),
        connectionId,
      );
      if (owner_id) {
        opts = {
          user_id: owner_id,
        };
      }
    }

    return {
      content: engagement.note,
      subject: engagement.subject,
      start_at: new Date(engagement.due_date + ' ' + engagement.due_time), // Combine due_date and due_time
      end_time: engagement.duration
        ? new Date(engagement.add_time + ' ' + engagement.duration)
        : undefined, // Derive end time if duration is provided
      type: 'MEETING',
      /*TODO: company_id: engagement.company_id
        ? String(engagement.company_id)
        : undefined,*/
      //contacts: engagement.participants.map((p) => String(p.person_id)), // Assuming participants are contacts
      field_mappings,
      ...opts,
    };
  }

  private async mapSingleEngagementEmailToUnified(
    engagement: PipedriveEngagementOutput,
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedEngagementOutput> {
    const field_mappings: { [key: string]: any } = {};
    if (customFieldMappings) {
      for (const mapping of customFieldMappings) {
        field_mappings[mapping.slug] = engagement[mapping.remote_id];
      }
    }

    const opts: any = {};
    if (engagement.user_id) {
      const owner_id = await this.utils.getUserUuidFromRemoteId(
        String(engagement.user_id),
        connectionId,
      );
      if (owner_id) {
        opts.user_id = owner_id;
      }
    }

    return {
      remote_id: String(engagement.id),
      content: engagement.note, // Assuming email content is stored in 'note'
      subject: engagement.subject,
      start_at: new Date(engagement.add_time), // Using 'add_time' as the start time
      end_time: engagement.marked_as_done_time
        ? new Date(engagement.marked_as_done_time)
        : undefined, // Using 'marked_as_done_time' as end time if available
      type: 'EMAIL',
      field_mappings,
      ...opts,
      /*TODO: company_id: engagement.company_id
        ? String(engagement.company_id)
        : undefined,*/
      //contacts: engagement.participants.map((p) => String(p.person_id)), // Assuming participants are contacts
    };
  }
}
