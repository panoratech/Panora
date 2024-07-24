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
  EngagementDirection,
  UnifiedCrmEngagementInput,
  UnifiedCrmEngagementOutput,
} from '@crm/engagement/types/model.unified';
import { IEngagementMapper } from '@crm/engagement/types';
import { Utils } from '@crm/@lib/@utils';
import { MappersRegistry } from '@@core/@core-services/registries/mappers.registry';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CloseEngagementMapper implements IEngagementMapper {
  constructor(private mappersRegistry: MappersRegistry, private utils: Utils) {
    this.mappersRegistry.registerService('crm', 'engagement', 'close', this);
  }

  mapToTaskDirection(
    data: 'outgoing' | 'incoming',
  ): EngagementDirection | string {
    switch (data) {
      case 'incoming':
        return 'INBOUND';
      case 'outgoing':
        return 'OUTBOUND';
    }
  }
  reverseMapToTaskDirection(data: EngagementDirection): string {
    switch (data) {
      case 'INBOUND':
        return 'incoming';
      case 'OUTBOUND':
        return 'outgoing';
    }
  }

  async desunify(
    source: UnifiedCrmEngagementInput,
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
    source: UnifiedCrmEngagementInput,
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
      note: source.content || null,
      duration: Math.floor(diffInMilliseconds / (1000 * 60)),
    };
    if (source.direction) {
      result.direction = source.direction.toLowerCase();
    }

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
    if (source?.contacts && source?.contacts?.length > 0) {
      const contactId = await this.utils.getRemoteIdFromContactUuid(
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
    source: UnifiedCrmEngagementInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<CloseEngagementMeetingInput> {
    return {};
  }

  private async desunifyEmail(
    source: UnifiedCrmEngagementInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<CloseEngagementEmailInput> {
    const result: CloseEngagementEmailInput = {
      body_text: source.content || null,
      status: null, // Placeholder, needs appropriate mapping
      sender: null,
      to: [],
      bcc: [],
      cc: [],
    };
    if (source.direction) {
      result.direction = this.reverseMapToTaskDirection(
        source.direction as EngagementDirection,
      );
    }
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
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedCrmEngagementOutput | UnifiedCrmEngagementOutput[]> {
    switch (engagement_type) {
      case 'CALL':
        return await this.unifyCall(
          source as CloseEngagementCallOutput | CloseEngagementCallOutput[],
          connectionId,
          customFieldMappings,
        );
      case 'MEETING':
        return await this.unifyMeeting(
          source as
            | CloseEngagementMeetingOutput
            | CloseEngagementMeetingOutput[],
          connectionId,
          customFieldMappings,
        );
      case 'EMAIL':
        return await this.unifyEmail(
          source as CloseEngagementEmailOutput | CloseEngagementEmailOutput[],
          connectionId,
          customFieldMappings,
        );
      default:
        break;
    }
  }

  private async unifyCall(
    source: CloseEngagementCallOutput | CloseEngagementCallOutput[],
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
    // Handling array of CloseEngagementOutput
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
    source: CloseEngagementMeetingOutput | CloseEngagementMeetingOutput[],
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
    // Handling array of CloseEngagementOutput
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
    source: CloseEngagementEmailOutput | CloseEngagementEmailOutput[],
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
    // Handling array of CloseEngagementOutput
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
    engagement: CloseEngagementCallOutput,
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
    if (engagement.created_by || engagement.user_id) {
      const owner_id = await this.utils.getUserUuidFromRemoteId(
        engagement.created_by || engagement.user_id,
        connectionId,
      );
      if (owner_id) {
        opts = {
          ...opts,
          user_id: owner_id,
        };
      }
    }
    if (engagement.contact_id) {
      const contact_id = await this.utils.getContactUuidFromRemoteId(
        engagement.contact_id,
        connectionId,
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
        connectionId,
      );
      if (lead_id) {
        opts = {
          ...opts,
          company_id: lead_id,
        };
      }
    }
    if (engagement.direction) {
      opts.direction = engagement.direction.toUpperCase();
    }
    return {
      remote_id: engagement.id,
      remote_data: engagement,
      content: engagement.note_html || engagement.note,
      subject: engagement.note,
      start_at: new Date(engagement.date_created),
      end_time: new Date(engagement.date_updated), // Assuming end time is mapped from last modified date
      type: 'CALL',
      field_mappings,
      ...opts,
    };
  }

  private async mapSingleEngagementMeetingToUnified(
    engagement: CloseEngagementMeetingOutput,
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
    if (engagement.user_id) {
      const owner_id = await this.utils.getUserUuidFromRemoteId(
        engagement.user_id,
        connectionId,
      );
      if (owner_id) {
        opts = {
          ...opts,
          user_id: owner_id,
        };
      }
    }
    if (engagement.user_id) {
      const owner_id = await this.utils.getUserUuidFromRemoteId(
        engagement.user_id,
        connectionId,
      );
      if (owner_id) {
        opts = {
          ...opts,
          user_id: owner_id,
        };
      }
    }
    if (engagement.contact_id) {
      const contact_id = await this.utils.getContactUuidFromRemoteId(
        engagement.contact_id,
        connectionId,
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
      remote_id: engagement.id,
      remote_data: engagement,
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
    if (engagement.user_id) {
      const owner_id = await this.utils.getUserUuidFromRemoteId(
        engagement.user_id,
        connectionId,
      );
      if (owner_id) {
        opts = {
          ...opts,
          user_id: owner_id,
        };
      }
    }
    if (engagement.contact_id) {
      const contact_id = await this.utils.getContactUuidFromRemoteId(
        engagement.contact_id,
        connectionId,
      );
      if (contact_id) {
        opts = {
          ...opts,
          contacts: [contact_id],
        };
      }
    }
    if (engagement.lead_id) {
      const lead_id = await this.utils.getCompanyUuidFromRemoteId(
        engagement.lead_id,
        connectionId,
      );
      if (lead_id) {
        opts = {
          ...opts,
          company_id: lead_id,
        };
      }
    }
    if (engagement.direction) {
      opts.direction = this.mapToTaskDirection(engagement.direction as any);
    }

    return {
      remote_id: engagement.id,
      remote_data: engagement,
      content: engagement.body_html,
      subject: engagement.subject,
      start_at: new Date(engagement.date_created),
      end_time: new Date(engagement.date_updated), // Assuming end time can be mapped from last modified date
      type: 'EMAIL',
      field_mappings,
      ...opts,
    };
  }
}
