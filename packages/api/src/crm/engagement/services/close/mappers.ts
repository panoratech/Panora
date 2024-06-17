import {
  CloseEngagementCallInput,
  CloseEngagementCallOutput,
  CloseEngagementEmailInput,
  CloseEngagementEmailOutput,
  CloseEngagementInput,
  CloseEngagementMeetingInput,
  CloseEngagementMeetingOutput,
  CloseEngagementOutput,
} from './types';
import {
  UnifiedEngagementInput,
  UnifiedEngagementOutput,
} from '@crm/engagement/types/model.unified';
import { IEngagementMapper } from '@crm/engagement/types';
import { Utils } from '@crm/@lib/@utils';
import { MappersRegistry } from '@@core/utils/registry/mappings.registry';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CloseEngagementMapper implements IEngagementMapper {
  constructor(private mappersRegistry: MappersRegistry, private utils: Utils) {
    this.mappersRegistry.registerService('crm', 'engagement', 'close', this);
  }

  async desunify(
    source: UnifiedEngagementInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<CloseEngagementInput> {
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

  private async desunifyCall(
    source: UnifiedEngagementInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<CloseEngagementCallInput> {
    const diffInMilliseconds =
      source.start_at && source.end_time
        ? new Date(source.end_time).getTime() -
          new Date(source.start_at).getTime()
        : 0;
    const result: CloseEngagementCallInput = {
      note_html: source.content || '',
      direction: (
        (source.direction === 'OUTBOUND' ? 'outgoing' : source.direction) || ''
      ).toLowerCase(),
      duration: Math.floor(diffInMilliseconds / (1000 * 60)),
    };

    // Map HubSpot owner ID from user ID
    if (source.user_id) {
      const owner_id = await this.utils.getRemoteIdFromUserUuid(source.user_id);
      if (owner_id) {
        result.created_by = owner_id;
        result.user_id = owner_id;
      }
    }
    if (source.company_id) {
      result.lead_id = await this.utils.getRemoteIdFromCompanyUuid(
        source.company_id,
      );
    }
    if (source?.contacts && source?.contacts?.length) {
      const contactId = await this.utils.getRemoteIdFromUserUuid(
        source.contacts[0],
      );
      if (contactId) {
        result.contact_id = contactId;
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

  private async desunifyMeeting(
    source: UnifiedEngagementInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<CloseEngagementMeetingInput> {
    return {};
  }

  private async desunifyEmail(
    source: UnifiedEngagementInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<CloseEngagementEmailInput> {
    const result: CloseEngagementEmailInput = {
      body_text: source.content || '',
      status: '', // Placeholder, needs appropriate mapping
      sender: '',
      to: [],
      bcc: [],
      cc: [],
      direction: (
        (source.direction === 'OUTBOUND' ? 'outgoing' : source.direction) || ''
      ).toLowerCase(),
    };

    // Map HubSpot owner ID from user ID
    if (source.user_id) {
      const owner_id = await this.utils.getRemoteIdFromUserUuid(source.user_id);
      if (owner_id) {
        result.user_id = owner_id;
      }
    }
    if (source.company_id) {
      result.lead_id = await this.utils.getRemoteIdFromCompanyUuid(
        source.company_id,
      );
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
    source: CloseEngagementOutput | CloseEngagementOutput[],
    engagement_type: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedEngagementOutput | UnifiedEngagementOutput[]> {
    switch (engagement_type) {
      case 'CALL':
        return await this.unifyCall(
          source as CloseEngagementCallOutput | CloseEngagementCallOutput[],
          customFieldMappings,
        );
      case 'MEETING':
        return await this.unifyMeeting(
          source as
            | CloseEngagementMeetingOutput
            | CloseEngagementMeetingOutput[],
          customFieldMappings,
        );
      case 'EMAIL':
        return await this.unifyEmail(
          source as CloseEngagementEmailOutput | CloseEngagementEmailOutput[],
          customFieldMappings,
        );
      default:
        break;
    }
  }

  private async unifyCall(
    source: CloseEngagementCallOutput | CloseEngagementCallOutput[],
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ) {
    if (!Array.isArray(source)) {
      return this.mapSingleEngagementCallToUnified(source, customFieldMappings);
    }
    // Handling array of CloseEngagementOutput
    return Promise.all(
      source.map((engagement) =>
        this.mapSingleEngagementCallToUnified(engagement, customFieldMappings),
      ),
    );
  }

  private async unifyMeeting(
    source: CloseEngagementMeetingOutput | CloseEngagementMeetingOutput[],
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ) {
    if (!Array.isArray(source)) {
      return this.mapSingleEngagementMeetingToUnified(
        source,
        customFieldMappings,
      );
    }
    // Handling array of CloseEngagementOutput
    return Promise.all(
      source.map((engagement) =>
        this.mapSingleEngagementMeetingToUnified(
          engagement,
          customFieldMappings,
        ),
      ),
    );
  }

  private async unifyEmail(
    source: CloseEngagementEmailOutput | CloseEngagementEmailOutput[],
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ) {
    if (!Array.isArray(source)) {
      return this.mapSingleEngagementEmailToUnified(
        source,
        customFieldMappings,
      );
    }
    // Handling array of CloseEngagementOutput
    return Promise.all(
      source.map((engagement) =>
        this.mapSingleEngagementEmailToUnified(engagement, customFieldMappings),
      ),
    );
  }

  private async mapSingleEngagementCallToUnified(
    engagement: CloseEngagementCallOutput,
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
    if (engagement.created_by || engagement.user_id) {
      const owner_id = await this.utils.getUserUuidFromRemoteId(
        engagement.created_by || engagement.user_id,
        'close',
      );
      if (owner_id) {
        opts = {
          user_id: owner_id,
        };
      }
    }
    if (engagement.contact_id) {
      const contact_id = await this.utils.getContactUuidFromRemoteId(
        engagement.contact_id,
        'close',
      );
      if (contact_id) {
        opts = {
          ...opts,
          contact_id: contact_id,
        };
      }
    }
    if (engagement.lead_id) {
      const lead_id = await this.utils.getCompanyUuidFromRemoteId(
        engagement.lead_id,
        'close',
      );
      if (lead_id) {
        opts = {
          ...opts,
          company_id: lead_id,
        };
      }
    }

    return {
      remote_id: engagement.id,
      content: engagement.note_html || engagement.note,
      subject: engagement.note,
      start_at: new Date(engagement.date_created),
      end_time: new Date(engagement.date_updated), // Assuming end time is mapped from last modified date
      type: 'CALL',
      direction: engagement.direction,
      field_mappings,
      ...opts,
    };
  }

  private async mapSingleEngagementMeetingToUnified(
    engagement: CloseEngagementMeetingOutput,
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
        engagement.user_id,
        'close',
      );
      if (owner_id) {
        opts = {
          user_id: owner_id,
        };
      }
    }
    if (engagement.user_id) {
      const owner_id = await this.utils.getUserUuidFromRemoteId(
        engagement.user_id,
        'close',
      );
      if (owner_id) {
        opts = {
          user_id: owner_id,
        };
      }
    }
    if (engagement.contact_id) {
      const contact_id = await this.utils.getContactUuidFromRemoteId(
        engagement.contact_id,
        'close',
      );
      if (contact_id) {
        opts = {
          ...opts,
          contact_id: contact_id,
        };
      }
    }
    if (engagement.lead_id) {
      const lead_id = await this.utils.getCompanyUuidFromRemoteId(
        engagement.lead_id,
        'close',
      );
      if (lead_id) {
        opts = {
          ...opts,
          company_id: lead_id,
        };
      }
    }

    return {
      remote_id: engagement.id,
      content: engagement.note,
      subject: engagement.title,
      start_at: new Date(engagement.starts_at),
      end_time: new Date(engagement.ends_at),
      type: 'MEETING',
      field_mappings,
      duration: engagement.duration,
      ...opts,
    };
  }

  private async mapSingleEngagementEmailToUnified(
    engagement: CloseEngagementEmailOutput,
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
        engagement.user_id,
        'close',
      );
      if (owner_id) {
        opts = {
          user_id: owner_id,
        };
      }
    }
    if (engagement.contact_id) {
      const contact_id = await this.utils.getContactUuidFromRemoteId(
        engagement.contact_id,
        'close',
      );
      if (contact_id) {
        opts = {
          ...opts,
          contact_id: contact_id,
        };
      }
    }
    if (engagement.lead_id) {
      const lead_id = await this.utils.getCompanyUuidFromRemoteId(
        engagement.lead_id,
        'close',
      );
      if (lead_id) {
        opts = {
          ...opts,
          company_id: lead_id,
        };
      }
    }

    return {
      remote_id: engagement.id,
      content: engagement.body_html,
      subject: '',
      start_at: new Date(engagement.date_created),
      end_time: new Date(engagement.date_updated), // Assuming end time can be mapped from last modified date
      type: 'EMAIL',
      direction:
        engagement.direction === 'outgoing'
          ? 'OUTBOUND'
          : engagement.direction === 'inbound'
          ? 'INBOUND'
          : '',
      field_mappings,
      ...opts,
    };
  }
}
