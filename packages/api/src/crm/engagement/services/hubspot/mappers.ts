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
  UnifiedEngagementInput,
  UnifiedEngagementOutput,
} from '@crm/engagement/types/model.unified';
import { IEngagementMapper } from '@crm/engagement/types';
import { Utils } from '@crm/deal/utils';

export class HubspotEngagementMapper implements IEngagementMapper {
  private readonly utils: Utils;

  constructor() {
    this.utils = new Utils();
  }

  async desunify(
    source: UnifiedEngagementInput,
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
    source: UnifiedEngagementInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<HubspotEngagementCallInput> {
    const result: HubspotEngagementCallInput = {
      hs_call_body: source.content || '',
      hs_timestamp: source.start_at?.toISOString() || '',
      hs_call_title: source.subject || '',
      // Assuming direction is used to determine call status
      hs_call_status: '',
      hs_call_duration: '', // Needs appropriate mapping
      hs_call_direction: source.direction || '', // Needs appropriate mapping
      hubspot_owner_id: '',
      hs_call_to_number: '', // Needs appropriate mapping
      hs_call_from_number: '', // Needs appropriate mapping
      hs_call_recording_url: '', // Needs appropriate mapping
    };

    // Map HubSpot owner ID from user ID
    if (source.user_id) {
      const owner_id = await this.utils.getRemoteIdFromUserUuid(source.user_id);
      if (owner_id) {
        result.hubspot_owner_id = owner_id;
      }
    }

    // Custom field mappings
    if (customFieldMappings && source.field_mappings) {
      customFieldMappings.forEach((mapping) => {
        const customValue = source.field_mappings.find((f) => f[mapping.slug]);
        if (customValue) {
          result[mapping.remote_id] = customValue[mapping.slug];
        }
      });
    }

    return result;
  }

  private async desunifyMeeting(
    source: UnifiedEngagementInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<HubspotEngagementMeetingInput> {
    const result: HubspotEngagementMeetingInput = {
      hs_timestamp: source.start_at?.toISOString() || '',
      hs_meeting_body: source.content || '',
      hs_meeting_title: source.subject || '',
      hs_meeting_outcome: '', // Placeholder, needs appropriate mapping
      hs_meeting_end_time: source.end_time?.toISOString() || '',
      hs_meeting_location: '', // Placeholder, needs appropriate mapping
      hs_meeting_start_time: source.start_at?.toISOString() || '',
      hs_meeting_external_url: '', // Placeholder, needs appropriate mapping
      hs_internal_meeting_notes: '', // Placeholder, needs appropriate mapping
      hubspot_owner_id: '',
    };

    // Map HubSpot owner ID from user ID
    if (source.user_id) {
      const owner_id = await this.utils.getRemoteIdFromUserUuid(source.user_id);
      if (owner_id) {
        result.hubspot_owner_id = owner_id;
      }
    }

    // Custom field mappings
    if (customFieldMappings && source.field_mappings) {
      customFieldMappings.forEach((mapping) => {
        const customValue = source.field_mappings.find((f) => f[mapping.slug]);
        if (customValue) {
          result[mapping.remote_id] = customValue[mapping.slug];
        }
      });
    }

    return result;
  }

  private async desunifyEmail(
    source: UnifiedEngagementInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<HubspotEngagementEmailInput> {
    const result: HubspotEngagementEmailInput = {
      hs_timestamp: source.start_at?.toISOString() || '',
      hs_email_text: source.content || '',
      hs_email_subject: source.subject || '',
      hs_email_status: '', // Placeholder, needs appropriate mapping
      hs_email_to_email: '', // Placeholder, needs appropriate mapping
      hs_email_direction:
        source.direction === 'INBOUND'
          ? 'INCOMING_EMAIL'
          : source.direction === 'OUTBOUND'
          ? 'FORWARDED_EMAIL'
          : '',
      hs_email_to_lastname: '', // Placeholder, needs appropriate mapping
      hs_email_sender_email: '', // Placeholder, needs appropriate mapping
      hs_email_to_firstname: '', // Placeholder, needs appropriate mapping
      hs_email_sender_lastname: '', // Placeholder, needs appropriate mapping
      hs_email_sender_firstname: '', // Placeholder, needs appropriate mapping
      hubspot_owner_id: '',
    };

    // Map HubSpot owner ID from user ID
    if (source.user_id) {
      const owner_id = await this.utils.getRemoteIdFromUserUuid(source.user_id);
      if (owner_id) {
        result.hubspot_owner_id = owner_id;
      }
    }

    // Custom field mappings
    if (customFieldMappings && source.field_mappings) {
      customFieldMappings.forEach((mapping) => {
        const customValue = source.field_mappings.find((f) => f[mapping.slug]);
        if (customValue) {
          result[mapping.remote_id] = customValue[mapping.slug];
        }
      });
    }

    return result;
  }

  async unify(
    source: HubspotEngagementOutput | HubspotEngagementOutput[],
    engagement_type: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedEngagementOutput | UnifiedEngagementOutput[]> {
    switch (engagement_type) {
      case 'CALL':
        return await this.unifyCall(
          source as HubspotEngagementCallOutput | HubspotEngagementCallOutput[],
          customFieldMappings,
        );
      case 'MEETING':
        return await this.unifyMeeting(
          source as
            | HubspotEngagementMeetingOutput
            | HubspotEngagementMeetingOutput[],
          customFieldMappings,
        );
      case 'EMAIL':
        return await this.unifyEmail(
          source as
            | HubspotEngagementEmailOutput
            | HubspotEngagementEmailOutput[],
          customFieldMappings,
        );
      default:
        break;
    }
  }

  private async unifyCall(
    source: HubspotEngagementCallOutput | HubspotEngagementCallOutput[],
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ) {
    if (!Array.isArray(source)) {
      return this.mapSingleEngagementCallToUnified(source, customFieldMappings);
    }
    // Handling array of HubspotEngagementOutput
    return Promise.all(
      source.map((engagement) =>
        this.mapSingleEngagementCallToUnified(engagement, customFieldMappings),
      ),
    );
  }

  private async unifyMeeting(
    source: HubspotEngagementMeetingOutput | HubspotEngagementMeetingOutput[],
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
    // Handling array of HubspotEngagementOutput
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
    source: HubspotEngagementEmailOutput | HubspotEngagementEmailOutput[],
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
    // Handling array of HubspotEngagementOutput
    return Promise.all(
      source.map((engagement) =>
        this.mapSingleEngagementEmailToUnified(engagement, customFieldMappings),
      ),
    );
  }

  private async mapSingleEngagementCallToUnified(
    engagement: HubspotEngagementCallOutput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedEngagementOutput> {
    const field_mappings =
      customFieldMappings?.map((mapping) => ({
        [mapping.slug]: engagement.properties[mapping.remote_id],
      })) || [];

    let opts: any = {};
    if (engagement.properties.hubspot_owner_id) {
      const owner_id = await this.utils.getUserUuidFromRemoteId(
        engagement.properties.hubspot_owner_id,
        'hubspot',
      );
      if (owner_id) {
        opts = {
          user_id: owner_id,
        };
      }
    }

    return {
      content: engagement.properties.hs_call_body,
      subject: engagement.properties.hs_call_title,
      start_at: new Date(engagement.properties.createdate),
      end_time: new Date(engagement.properties.hs_lastmodifieddate), // Assuming end time is mapped from last modified date
      type: 'CALL',
      direction: engagement.properties.hs_call_direction,
      field_mappings,
      ...opts,
    };
  }

  private async mapSingleEngagementMeetingToUnified(
    engagement: HubspotEngagementMeetingOutput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedEngagementOutput> {
    const field_mappings =
      customFieldMappings?.map((mapping) => ({
        [mapping.slug]: engagement.properties[mapping.remote_id],
      })) || [];

    let opts: any = {};
    if (engagement.properties.hubspot_owner_id) {
      const owner_id = await this.utils.getUserUuidFromRemoteId(
        engagement.properties.hubspot_owner_id,
        'hubspot',
      );
      if (owner_id) {
        opts = {
          user_id: owner_id,
        };
      }
    }

    return {
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
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedEngagementOutput> {
    const field_mappings =
      customFieldMappings?.map((mapping) => ({
        [mapping.slug]: engagement.properties[mapping.remote_id],
      })) || [];

    let opts: any = {};
    if (engagement.properties.hubspot_owner_id) {
      const owner_id = await this.utils.getUserUuidFromRemoteId(
        engagement.properties.hubspot_owner_id,
        'hubspot',
      );
      if (owner_id) {
        opts = {
          user_id: owner_id,
        };
      }
    }

    return {
      content: engagement.properties.hs_email_text,
      subject: engagement.properties.hs_email_subject,
      start_at: new Date(engagement.properties.createdate),
      end_time: new Date(engagement.properties.hs_lastmodifieddate), // Assuming end time can be mapped from last modified date
      type: 'EMAIL',
      direction:
        engagement.properties.hs_email_direction === 'INCOMING_EMAIL'
          ? 'INBOUND'
          : engagement.properties.hs_email_direction === 'FORWARDED_EMAIL'
          ? 'OUTBOUND'
          : '',
      field_mappings,
      ...opts,
    };
  }
}
