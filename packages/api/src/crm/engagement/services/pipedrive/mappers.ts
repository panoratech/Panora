import { PipedriveEngagementInput, PipedriveEngagementOutput } from './types';
import {
  UnifiedCrmEngagementInput,
  UnifiedCrmEngagementOutput,
} from '@crm/engagement/types/model.unified';
import { IEngagementMapper } from '@crm/engagement/types';
import { Utils } from '@crm/@lib/@utils';
import { MappersRegistry } from '@@core/@core-services/registries/mappers.registry';
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

  async desunify(
    source: UnifiedCrmEngagementInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<PipedriveEngagementInput> {
    const result: PipedriveEngagementInput = {
      subject: source.subject || null,
      public_description: source.content || null,
    };

    if (source.type) {
      result.type = `${source.type.substring(0, 1)}${source.type
        .substring(1)
        .toUpperCase()}`;
    }

    if (source.start_at && source.end_time) {
      const startDate = new Date(source.start_at);
      const endDate = new Date(source.end_time);

      const diffMilliseconds = endDate.getTime() - startDate.getTime();
      const durationInSeconds = Math.round(diffMilliseconds / 1000);

      const dueDate = startDate.toISOString().split('T')[0];
      const dueTime = startDate.toTimeString().split(' ')[0].substring(0, 5);
      const duration = `${String(Math.floor(durationInSeconds / 60)).padStart(
        2,
        '0',
      )}:${String(durationInSeconds % 60).padStart(2, '0')}`;

      result.due_date = dueDate;
      result.due_time = dueTime;
      result.duration = duration;
    }

    if (source.user_id) {
      const owner_id = await this.utils.getRemoteIdFromUserUuid(source.user_id);
      if (owner_id) {
        result.user_id = Number(owner_id);
      }
    }
    if (source.contacts && source.contacts.length > 0) {
      const id = await this.utils.getRemoteIdFromContactUuid(
        source.contacts[0],
      );
      if (id) {
        result.person_id = Number(id);
      }
    }
    if (source.company_id) {
      const id = await this.utils.getRemoteIdFromCompanyUuid(source.company_id);
      if (id) {
        result.org_id = Number(id);
      }
    }

    return result;
  }

  async unify(
    source: PipedriveEngagementOutput | PipedriveEngagementOutput[],
    engagement_type: string,
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedCrmEngagementOutput | UnifiedCrmEngagementOutput[]> {
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
  ): Promise<UnifiedCrmEngagementOutput> {
    const field_mappings: { [key: string]: any } = {};
    if (customFieldMappings) {
      for (const mapping of customFieldMappings) {
        field_mappings[mapping.slug] = engagement[mapping.remote_id];
      }
    }

    const opts: any = {
      contacts: [],
    };
    if (engagement.user_id) {
      const owner_id = await this.utils.getUserUuidFromRemoteId(
        String(engagement.user_id),
        connectionId,
      );
      if (owner_id) {
        opts.user_id = owner_id;
      }
    }
    if (engagement.org_id) {
      const company_id = await this.utils.getCompanyUuidFromRemoteId(
        String(engagement.org_id),
        connectionId,
      );
      if (company_id) {
        opts.company_id = company_id;
      }
    }

    if (engagement.person_id) {
      const person_id = await this.utils.getContactUuidFromRemoteId(
        String(engagement.person_id),
        connectionId,
      );
      if (person_id) {
        opts.contacts = [person_id];
      }
    }

    if (engagement.attendee && engagement.attendee.length > 0) {
      for (const p of engagement.attendee) {
        if (p.person_id) {
          const id = await this.utils.getContactUuidFromRemoteId(
            String(p.person_id),
            connectionId,
          );
          if (id) {
            opts.contacts.push(id);
          }
        }
      }
    }

    if (engagement.participants && engagement.participants.length > 0) {
      for (const p of engagement.participants) {
        if (p.person_id) {
          const id = await this.utils.getContactUuidFromRemoteId(
            String(p.person_id),
            connectionId,
          );
          if (id) {
            opts.contacts.push(id);
          }
        }
      }
    }

    return {
      remote_id: String(engagement.id),
      remote_data: engagement,
      content: engagement.public_description,
      subject: engagement.subject,
      start_at: null,
      end_time: new Date(engagement.due_date),
      type: 'CALL',
      field_mappings,
      ...opts,
    };
  }

  private async mapSingleEngagementMeetingToUnified(
    engagement: PipedriveEngagementOutput,
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedCrmEngagementOutput> {
    const field_mappings: { [key: string]: any } = {};
    if (customFieldMappings) {
      for (const mapping of customFieldMappings) {
        field_mappings[mapping.slug] = engagement[mapping.remote_id];
      }
    }

    let opts: any = {
      contacts: [],
    };
    if (engagement.user_id) {
      const owner_id = await this.utils.getUserUuidFromRemoteId(
        String(engagement.user_id),
        connectionId,
      );
      if (owner_id) {
        opts = {
          ...opts,
          user_id: owner_id,
        };
      }
    }
    if (engagement.org_id) {
      const company_id = await this.utils.getCompanyUuidFromRemoteId(
        String(engagement.org_id),
        connectionId,
      );
      if (company_id) {
        opts.company_id = company_id;
      }
    }

    if (engagement.person_id) {
      const person_id = await this.utils.getContactUuidFromRemoteId(
        String(engagement.person_id),
        connectionId,
      );
      if (person_id) {
        opts.contacts.push(person_id);
      }
    }

    if (engagement.attendee && engagement.attendee.length > 0) {
      for (const p of engagement.attendee) {
        if (p.person_id) {
          const id = await this.utils.getContactUuidFromRemoteId(
            String(p.person_id),
            connectionId,
          );
          if (id) {
            opts.contacts.push(id);
          }
        }
      }
    }

    if (engagement.participants && engagement.participants.length > 0) {
      for (const p of engagement.participants) {
        if (p.person_id) {
          const id = await this.utils.getContactUuidFromRemoteId(
            String(p.person_id),
            connectionId,
          );
          if (id) {
            opts.contacts.push(id);
          }
        }
      }
    }

    return {
      remote_id: String(engagement.id),
      remote_data: engagement,
      content: engagement.note,
      subject: engagement.subject,
      end_time: new Date(engagement.due_date),
      type: 'MEETING',
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
  ): Promise<UnifiedCrmEngagementOutput> {
    const field_mappings: { [key: string]: any } = {};
    if (customFieldMappings) {
      for (const mapping of customFieldMappings) {
        field_mappings[mapping.slug] = engagement[mapping.remote_id];
      }
    }

    const opts: any = {
      contacts: [],
    };
    if (engagement.user_id) {
      const owner_id = await this.utils.getUserUuidFromRemoteId(
        String(engagement.user_id),
        connectionId,
      );
      if (owner_id) {
        opts.user_id = owner_id;
      }
    }
    if (engagement.org_id) {
      const company_id = await this.utils.getCompanyUuidFromRemoteId(
        String(engagement.org_id),
        connectionId,
      );
      if (company_id) {
        opts.company_id = company_id;
      }
    }

    if (engagement.person_id) {
      const person_id = await this.utils.getContactUuidFromRemoteId(
        String(engagement.person_id),
        connectionId,
      );
      if (person_id) {
        opts.contacts.push(person_id);
      }
    }

    if (engagement.attendee && engagement.attendee.length > 0) {
      for (const p of engagement.attendee) {
        if (p.person_id) {
          const id = await this.utils.getContactUuidFromRemoteId(
            String(p.person_id),
            connectionId,
          );
          if (id) {
            opts.contacts.push(id);
          }
        }
      }
    }

    if (engagement.participants && engagement.participants.length > 0) {
      for (const p of engagement.participants) {
        if (p.person_id) {
          const id = await this.utils.getContactUuidFromRemoteId(
            String(p.person_id),
            connectionId,
          );
          if (id) {
            opts.contacts.push(id);
          }
        }
      }
    }

    return {
      remote_id: String(engagement.id),
      remote_data: engagement,
      content: engagement.note, // Assuming email content is stored in 'note'
      subject: engagement.subject,
      end_time: new Date(engagement.due_date),
      type: 'EMAIL',
      field_mappings,
      ...opts,
    };
  }
}
