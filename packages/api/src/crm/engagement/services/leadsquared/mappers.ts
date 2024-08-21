import {
  LeadSquaredEngagementCallInput,
  LeadSquaredEngagementEmailInput,
  LeadSquaredEngagementEmailOutput,
  LeadSquaredEngagementInput,
  LeadSquaredEngagementMeetingInput,
  LeadSquaredEngagementMeetingOutput,
  LeadSquaredEngagementOutput,
} from './types';

import {
  UnifiedCrmEngagementInput,
  UnifiedCrmEngagementOutput,
} from '@crm/engagement/types/model.unified';
import { IEngagementMapper } from '@crm/engagement/types';
import { Utils } from '@crm/@lib/@utils';
import { MappersRegistry } from '@@core/@core-services/registries/mappers.registry';
import { Injectable } from '@nestjs/common';

@Injectable()
export class LeadSquaredEngagementMapper implements IEngagementMapper {
  constructor(
    private mappersRegistry: MappersRegistry,
    private utils: Utils,
  ) {
    this.mappersRegistry.registerService(
      'crm',
      'engagement',
      'leadsquared',
      this,
    );
  }

  formatDateForLeadSquared(date: Date): string {
    const year = date.getUTCFullYear();
    const month = date.getUTCMonth() + 1;
    const currentDate = date.getUTCDate();
    const hours = date.getUTCHours();
    const minutes = date.getUTCMinutes();
    const seconds = date.getUTCSeconds();
    return `${year}-${month}-${currentDate} ${hours}:${minutes}:${seconds}`;
  }

  async desunify(
    source: UnifiedCrmEngagementInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<LeadSquaredEngagementInput> {
    const type = source.type;
    switch (type) {
      case 'CALL':
        return await this.desunifyCall(source, customFieldMappings);
      case 'MEETING':
        return await this.desunifyMeeting(source, customFieldMappings);
      case 'EMAIL':
        return await this.desunifyEmail(source, customFieldMappings);
      default:
        break;
    }
    return;
  }

  private async desunifyEmail(
    source: UnifiedCrmEngagementInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<LeadSquaredEngagementInput> {
    const result: LeadSquaredEngagementEmailInput = {
      Subject: source.subject,
      EmailType: 'Html',
      ContentHTML: source.content,
      ContentText: source.content,
      IncludeEmailFooter: true,
    };

    if (source.user_id) {
      const owner_id = await this.utils.getRemoteIdFromUserUuid(source.user_id);
      if (owner_id) {
        result.SenderType = 'UserId';
        result.Sender = owner_id;
      }
    }

    if (source.company_id) {
      const company_id = await this.utils.getRemoteIdFromCompanyUuid(
        source.company_id,
      );
      if (company_id) {
        result.RecipientType = 'LeadId';
        result.Recipient = company_id;
      }
    }

    // contact is lead in this case
    if (source.contacts && source.contacts.length > 0) {
      const contact_id = await this.utils.getRemoteIdFromContactUuid(
        source.contacts[0],
      );
      result.RecipientType = 'LeadId';
      result.Recipient = contact_id;
    }

    if (customFieldMappings && source.field_mappings) {
      for (const [k, v] of Object.entries(source.field_mappings)) {
        const mapping = customFieldMappings.find(
          (mapping) => mapping.slug === k,
        );
        if (mapping) {
          result[mapping.remote_id] = v;
        }
      }
    }

    return result;
  }

  private async desunifyMeeting(
    source: UnifiedCrmEngagementInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<LeadSquaredEngagementInput> {
    const result: LeadSquaredEngagementMeetingInput = {
      Name: source.subject,
      Description: source.content,
      StatusCode: '0',
      NotifyBy: '1100',
      Reminder: 30,
      TaskType: {
        Name: 'Meeting',
      },
    };

    if (source.start_at) {
      result.DueDate = this.formatDateForLeadSquared(new Date(source.start_at));
    }

    if (source.end_time) {
      result.EndDate = this.formatDateForLeadSquared(new Date(source.end_time));
    }

    if (source.user_id) {
      const owner_id = await this.utils.getRemoteIdFromUserUuid(source.user_id);
      if (owner_id) {
        result.OwnerId = owner_id;
      }
    }

    if (source.company_id) {
      const company_id = await this.utils.getRemoteIdFromCompanyUuid(
        source.company_id,
      );
      if (company_id) {
        result.RelatedEntity = '1';
        result.RelatedEntityId = company_id;
      }
    }

    // contact is lead in this case
    if (source.contacts && source.contacts.length > 0) {
      const lead_id = await this.utils.getRemoteIdFromCompanyUuid(
        source.company_id,
      );
      if (lead_id) {
        result.RelatedEntity = '1';
        result.RelatedEntityId = lead_id;
      }
    }

    if (customFieldMappings && source.field_mappings) {
      for (const [k, v] of Object.entries(source.field_mappings)) {
        const mapping = customFieldMappings.find(
          (mapping) => mapping.slug === k,
        );
        if (mapping) {
          result[mapping.remote_id] = v;
        }
      }
    }

    return result;
  }

  private async desunifyCall(
    source: UnifiedCrmEngagementInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<LeadSquaredEngagementInput> {
    const result: LeadSquaredEngagementCallInput = {
      Direction: source.direction === 'INBOUND' ? 'Inbound' : 'Outbound',
      CallerSource: source.content || '',
      LeadId: source.company_id || '',
      SourceNumber: '+91-8611795988', // todo,
      DisplayNumber: '+91-8611795989', // todo
      DestinationNumber: '+91-9611795983', // todo,
    };

    if (source.start_at && source.end_time) {
      const startDate = new Date(source.start_at);
      const endDate = new Date(source.end_time);

      // Calculate the difference in milliseconds
      const diffMilliseconds = endDate.getTime() - startDate.getTime();

      // Convert milliseconds to seconds
      const durationInSeconds = Math.round(diffMilliseconds / 1000);
      result.StartTime = this.formatDateForLeadSquared(startDate);
      result.EndTime = this.formatDateForLeadSquared(endDate);
      result.CallDuration = durationInSeconds;
      result.Status = 'Answered';
    }

    if (source.user_id) {
      const owner_id = await this.utils.getRemoteIdFromUserUuid(source.user_id);
      if (owner_id) {
        result.UserId = owner_id;
      }
    }

    if (customFieldMappings && source.field_mappings) {
      for (const [k, v] of Object.entries(source.field_mappings)) {
        const mapping = customFieldMappings.find(
          (mapping) => mapping.slug === k,
        );
        if (mapping) {
          result[mapping.remote_id] = v;
        }
      }
    }

    return result;
  }

  async unify(
    source: LeadSquaredEngagementOutput | LeadSquaredEngagementOutput[],
    engagement_type: string,
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedCrmEngagementOutput | UnifiedCrmEngagementOutput[]> {
    switch (engagement_type) {
      case 'CALL':
        return;
      case 'MEETING':
        return await this.unifyMeeting(
          source as LeadSquaredEngagementMeetingOutput,
          connectionId,
          customFieldMappings,
        );
      case 'EMAIL':
        return await this.unifyEmail(
          source as LeadSquaredEngagementEmailOutput,
          connectionId,
          customFieldMappings,
        );

      default:
        break;
    }
  }

  private async unifyMeeting(
    engagement: LeadSquaredEngagementMeetingOutput,
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

    let opts: any = {};
    if (engagement.OwnerId) {
      const owner_id = await this.utils.getUserUuidFromRemoteId(
        String(engagement.OwnerId),
        connectionId,
      );
      if (owner_id) {
        opts = {
          ...opts,
          user_id: owner_id,
        };
      }
    }

    return {
      remote_id: String(engagement.UserTaskId),
      remote_data: engagement,
      content: engagement.Description || engagement.Name,
      subject: null,
      start_at: new Date(engagement.DueDate),
      end_time: new Date(engagement.EndDate),
      type: 'MEETING',
      field_mappings,
      direction: '',
      ...opts,
    };
  }
  private async unifyEmail(
    engagement: LeadSquaredEngagementEmailOutput,
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
    let opts: any = {};
    if (engagement.SenderType === 'UserId') {
      const owner_id = await this.utils.getUserUuidFromRemoteId(
        String(engagement.Sender),
        connectionId,
      );
      if (owner_id) {
        opts = {
          ...opts,
          user_id: owner_id,
        };
      }
    }
    if (engagement.RecipientType === 'LeadId') {
      const lead_id = await this.utils.getCompanyUuidFromRemoteId(
        String(engagement.Recipient),
        connectionId,
      );
      if (lead_id) {
        opts = {
          ...opts,
          company_id: lead_id,
        };
      }
    }

    return {
      remote_id: String(engagement.EmailId),
      remote_data: engagement,
      content: engagement.ContentText,
      subject: engagement.Subject,
      type: 'EMAIL',
      field_mappings,
      direction: '',
      ...opts,
    };
  }
}
