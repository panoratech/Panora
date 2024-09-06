import {
  HubspotEngagementCallInput,
  HubspotEngagementCallOutput,
  HubspotEngagementEmailInput,
  HubspotEngagementEmailOutput,
  HubspotEngagementInput,
  HubspotEngagementMeetingInput,
  HubspotEngagementMeetingOutput,
  HubspotEngagementOutput,
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
export class HubspotEngagementMapper implements IEngagementMapper {
  constructor(private mappersRegistry: MappersRegistry, private utils: Utils) {
    this.mappersRegistry.registerService('crm', 'engagement', 'hubspot', this);
  }

  async desunify(
    source: UnifiedCrmEngagementInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<HubspotEngagementInput> {
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
  ): Promise<HubspotEngagementCallInput> {
    const result: HubspotEngagementCallInput = {
      hs_call_body: source.content || null,
      hs_timestamp: new Date() as any,
      hs_call_title: source.subject || null,
      hs_call_status: null,
      hs_call_duration: null, // Needs appropriate mapping
      hs_call_direction: source.direction || null, // Needs appropriate mapping
      hubspot_owner_id: null,
      hs_call_to_number: null, // Needs appropriate mapping
      hs_call_from_number: null, // Needs appropriate mapping
      hs_call_recording_url: null, // Needs appropriate mapping
    };

    // Map HubSpot owner ID from user ID
    if (source.user_id) {
      const owner_id = await this.utils.getRemoteIdFromUserUuid(source.user_id);
      if (owner_id) {
        result.hubspot_owner_id = owner_id;
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
  ): Promise<HubspotEngagementMeetingInput> {
    const result: HubspotEngagementMeetingInput = {
      hs_timestamp: new Date() as any,
      hs_meeting_body: source.content || null,
      hs_meeting_title: source.subject || null,
      hs_meeting_outcome: null, // Placeholder, needs appropriate mapping
      hs_meeting_end_time: (source.end_time as any) ?? null,
      hs_meeting_location: null, // Placeholder, needs appropriate mapping
      hs_meeting_start_time: (source.start_at as any) ?? null,
      hs_meeting_external_url: null, // Placeholder, needs appropriate mapping
      hs_internal_meeting_notes: null, // Placeholder, needs appropriate mapping
      hubspot_owner_id: null,
    };

    // Map HubSpot owner ID from user ID
    if (source.user_id) {
      const owner_id = await this.utils.getRemoteIdFromUserUuid(source.user_id);
      if (owner_id) {
        result.hubspot_owner_id = owner_id;
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

  private async desunifyEmail(
    source: UnifiedCrmEngagementInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<HubspotEngagementEmailInput> {
    const result: HubspotEngagementEmailInput = {
      hs_timestamp: new Date() as any,
      hs_email_text: source.content || null,
      hs_email_subject: source.subject || null,
      hs_email_status: null, // Placeholder, needs appropriate mapping
      hs_email_to_email: null, // Placeholder, needs appropriate mapping
      hs_email_direction:
        source.direction === 'INBOUND'
          ? 'INCOMING_EMAIL'
          : source.direction === 'OUTBOUND'
          ? 'FORWARDED_EMAIL'
          : null,
      hs_email_to_lastname: null, // Placeholder, needs appropriate mapping
      hs_email_sender_email: null, // Placeholder, needs appropriate mapping
      hs_email_to_firstname: null, // Placeholder, needs appropriate mapping
      hs_email_sender_lastname: null, // Placeholder, needs appropriate mapping
      hs_email_sender_firstname: null, // Placeholder, needs appropriate mapping
      hubspot_owner_id: null,
    };

    // Map HubSpot owner ID from user ID
    if (source.user_id) {
      const owner_id = await this.utils.getRemoteIdFromUserUuid(source.user_id);
      if (owner_id) {
        result.hubspot_owner_id = owner_id;
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
    source: HubspotEngagementOutput | HubspotEngagementOutput[],
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
          source as HubspotEngagementCallOutput | HubspotEngagementCallOutput[],
          connectionId,
          customFieldMappings,
        );
      case 'MEETING':
        return await this.unifyMeeting(
          source as
            | HubspotEngagementMeetingOutput
            | HubspotEngagementMeetingOutput[],
          connectionId,
          customFieldMappings,
        );
      case 'EMAIL':
        return await this.unifyEmail(
          source as
            | HubspotEngagementEmailOutput
            | HubspotEngagementEmailOutput[],
          connectionId,
          customFieldMappings,
        );
      default:
        break;
    }
  }

  private async unifyCall(
    source: HubspotEngagementCallOutput | HubspotEngagementCallOutput[],
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
    // Handling array of HubspotEngagementOutput
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
    source: HubspotEngagementMeetingOutput | HubspotEngagementMeetingOutput[],
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
    // Handling array of HubspotEngagementOutput
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
    source: HubspotEngagementEmailOutput | HubspotEngagementEmailOutput[],
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
    // Handling array of HubspotEngagementOutput
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
    engagement: HubspotEngagementCallOutput,
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedCrmEngagementOutput> {
    const field_mappings: { [key: string]: any } = {};
    if (customFieldMappings) {
      for (const mapping of customFieldMappings) {
        field_mappings[mapping.slug] = engagement.properties[mapping.remote_id];
      }
    }

    let opts: any = {};
    if (engagement.properties.hubspot_owner_id) {
      const owner_id = await this.utils.getUserUuidFromRemoteId(
        engagement.properties.hubspot_owner_id,
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
      remote_data: engagement,
      remote_id: engagement.id,
      content: engagement.properties.hs_call_body,
      subject: engagement.properties.hs_call_title,
      type: 'CALL',
      direction: engagement.properties.hs_call_direction,
      field_mappings,
      ...opts,
    };
  }

  private async mapSingleEngagementMeetingToUnified(
    engagement: HubspotEngagementMeetingOutput,
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedCrmEngagementOutput> {
    const field_mappings: { [key: string]: any } = {};
    if (customFieldMappings) {
      for (const mapping of customFieldMappings) {
        field_mappings[mapping.slug] = engagement.properties[mapping.remote_id];
      }
    }

    let opts: any = {};
    if (engagement.properties.hubspot_owner_id) {
      const owner_id = await this.utils.getUserUuidFromRemoteId(
        engagement.properties.hubspot_owner_id,
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
      remote_data: engagement,
      remote_id: engagement.id,
      content: engagement.properties.hs_meeting_body,
      subject: engagement.properties.hs_meeting_title,
      start_at: new Date(engagement.properties.hs_meeting_start_time),
      end_time: new Date(engagement.properties.hs_meeting_end_time),
      type: 'MEETING',
      field_mappings,
      ...opts,
    };
  }

  private async mapSingleEngagementEmailToUnified(
    engagement: HubspotEngagementEmailOutput,
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedCrmEngagementOutput> {
    const field_mappings: { [key: string]: any } = {};
    if (customFieldMappings) {
      for (const mapping of customFieldMappings) {
        field_mappings[mapping.slug] = engagement.properties[mapping.remote_id];
      }
    }

    let opts: any = {};
    if (engagement.properties.hubspot_owner_id) {
      const owner_id = await this.utils.getUserUuidFromRemoteId(
        engagement.properties.hubspot_owner_id,
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
      remote_id: engagement.id,
      remote_data: engagement,
      content: engagement.properties.hs_email_text,
      subject: engagement.properties.hs_email_subject,
      type: 'EMAIL',
      direction:
        engagement.properties.hs_email_direction === 'INCOMING_EMAIL'
          ? 'INBOUND'
          : engagement.properties.hs_email_direction === 'FORWARDED_EMAIL'
          ? 'OUTBOUND'
          : null,
      field_mappings,
      ...opts,
    };
  }
}
