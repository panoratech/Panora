import {
    MicrosoftdynamicssalesEngagementAppointmentInput,
    MicrosoftdynamicssalesEngagementAppointmentOutput,
    MicrosoftdynamicssalesEngagementCallInput,
    MicrosoftdynamicssalesEngagementCallOutput,
    MicrosoftdynamicssalesEngagementEmailInput,
    MicrosoftdynamicssalesEngagementEmailOutput,
    MicrosoftdynamicssalesEngagementInput,
    MicrosoftdynamicssalesEngagementOutput
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
export class MicrosoftdynamicssalesEngagementMapper implements IEngagementMapper {
    constructor(private mappersRegistry: MappersRegistry, private utils: Utils) {
        this.mappersRegistry.registerService('crm', 'engagement', 'microsoftdynamicssales', this);
    }

    async desunify(
        source: UnifiedCrmEngagementInput,
        customFieldMappings?: {
            slug: string;
            remote_id: string;
        }[],
    ): Promise<MicrosoftdynamicssalesEngagementInput> {
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
    ): Promise<MicrosoftdynamicssalesEngagementCallInput> {
        const result: MicrosoftdynamicssalesEngagementCallInput = {
            description: source.content ?? '',
            subject: source.subject ?? '',
        };

        if (source.start_at) {
            result.actualstart = new Date(source.start_at).toUTCString();
        }

        if (source.end_time) {
            result.actualend = new Date(source.end_time).toUTCString();
        }

        if (source.direction) {
            result.directioncode = source.direction === 'INBOUND' ? false : true;

        }

        if (source.company_id) {
            const id = await this.utils.getRemoteIdFromCompanyUuid(source.company_id);
            result["regardingobjectid_account@odata.bind"] = `/accounts(${id})`;
        }

        // Only assigning first contact from contacts
        if (source.contacts && source.contacts.length > 0) {
            const id = await this.utils.getRemoteIdFromContactUuid(source.contacts[0]);
            result["regardingobjectid_contact@odata.bind"] = `/contacts(${id})`;
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
    ): Promise<MicrosoftdynamicssalesEngagementAppointmentInput> {
        const result: MicrosoftdynamicssalesEngagementAppointmentInput = {
            description: source.content ?? '',
            subject: source.subject ?? '',
        };

        if (source.start_at) {
            result.actualstart = new Date(source.start_at).toUTCString();
        }

        if (source.end_time) {
            result.actualend = new Date(source.end_time).toUTCString();
        }

        if (source.company_id) {
            const id = await this.utils.getRemoteIdFromCompanyUuid(source.company_id);
            result["regardingobjectid_account@odata.bind"] = `/accounts(${id})`;
        }

        // Only assigning first contact from contacts
        if (source.contacts && source.contacts.length > 0) {
            const id = await this.utils.getRemoteIdFromContactUuid(source.contacts[0]);
            result["regardingobjectid_contact@odata.bind"] = `/contacts(${id})`;
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
    ): Promise<MicrosoftdynamicssalesEngagementEmailInput> {
        const result: MicrosoftdynamicssalesEngagementEmailInput = {
            description: source.content ?? '',
            subject: source.subject ?? '',
        };

        if (source.start_at) {
            result.actualstart = new Date(source.start_at).toUTCString();
        }

        if (source.end_time) {
            result.actualend = new Date(source.end_time).toUTCString();
        }

        if (source.direction) {
            result.directioncode = source.direction === 'INBOUND' ? false : true;

        }

        if (source.company_id) {
            const id = await this.utils.getRemoteIdFromCompanyUuid(source.company_id);
            result["regardingobjectid_account@odata.bind"] = `/accounts(${id})`;
        }

        // Only assigning first contact from contacts
        if (source.contacts && source.contacts.length > 0) {
            const id = await this.utils.getRemoteIdFromContactUuid(source.contacts[0]);
            result["regardingobjectid_contact@odata.bind"] = `/contacts(${id})`;
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
        source: MicrosoftdynamicssalesEngagementOutput | MicrosoftdynamicssalesEngagementOutput[],
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
                    source as MicrosoftdynamicssalesEngagementCallOutput | MicrosoftdynamicssalesEngagementCallOutput[],
                    connectionId,
                    customFieldMappings,
                );
            case 'MEETING':
                return await this.unifyMeeting(
                    source as
                    | MicrosoftdynamicssalesEngagementAppointmentOutput
                    | MicrosoftdynamicssalesEngagementAppointmentOutput[],
                    connectionId,
                    customFieldMappings,
                );
            case 'EMAIL':
                return await this.unifyEmail(
                    source as
                    | MicrosoftdynamicssalesEngagementEmailOutput
                    | MicrosoftdynamicssalesEngagementEmailOutput[],
                    connectionId,
                    customFieldMappings,
                );
            default:
                break;
        }
    }

    private async unifyCall(
        source: MicrosoftdynamicssalesEngagementCallOutput | MicrosoftdynamicssalesEngagementCallOutput[],
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
        // Handling array of MicrosoftdynamicssalesEngagementOutput
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
        source: MicrosoftdynamicssalesEngagementAppointmentOutput | MicrosoftdynamicssalesEngagementAppointmentOutput[],
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
        // Handling array of MicrosoftdynamicssalesEngagementOutput
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
        source: MicrosoftdynamicssalesEngagementEmailOutput | MicrosoftdynamicssalesEngagementEmailOutput[],
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
        // Handling array of MicrosoftdynamicssalesEngagementOutput
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
        engagement: MicrosoftdynamicssalesEngagementCallOutput,
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
        if (engagement._ownerid_value) {
            const owner_id = await this.utils.getUserUuidFromRemoteId(
                engagement._ownerid_value,
                connectionId,
            );
            if (owner_id) {
                opts = {
                    ...opts,
                    user_id: owner_id,
                };
            }
        }

        if (engagement._regardingobjectid_value) {
            const company_id = await this.utils.getCompanyUuidFromRemoteId(
                engagement._regardingobjectid_value,
                connectionId
            );

            if (company_id) {
                opts = {
                    ...opts,
                    company_id: company_id
                }
            }

            const contact_id = await this.utils.getContactUuidFromRemoteId(
                engagement._regardingobjectid_value,
                connectionId
            );

            if (contact_id) {
                opts = {
                    ...opts,
                    contacts: [contact_id]
                }
            }
        }



        return {
            remote_data: engagement,
            remote_id: engagement.activityid,
            content: engagement.description ?? '',
            subject: engagement.subject ?? '',
            start_at: engagement.actualstart ? new Date(engagement.actualstart) : null,
            end_time: engagement.actualend ? new Date(engagement.actualend) : null,
            type: 'CALL',
            direction: engagement.directioncode ? engagement.directioncode ? "OUTBOUND" : "INBOUND" : null,
            field_mappings,
            ...opts,
        };
    }

    private async mapSingleEngagementMeetingToUnified(
        engagement: MicrosoftdynamicssalesEngagementAppointmentOutput,
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
        if (engagement._ownerid_value) {
            const owner_id = await this.utils.getUserUuidFromRemoteId(
                engagement._ownerid_value,
                connectionId,
            );
            if (owner_id) {
                opts = {
                    ...opts,
                    user_id: owner_id,
                };
            }
        }

        if (engagement._regardingobjectid_value) {
            const company_id = await this.utils.getCompanyUuidFromRemoteId(
                engagement._regardingobjectid_value,
                connectionId
            );

            if (company_id) {
                opts = {
                    ...opts,
                    company_id: company_id
                }
            }

            const contact_id = await this.utils.getContactUuidFromRemoteId(
                engagement._regardingobjectid_value,
                connectionId
            );

            if (contact_id) {
                opts = {
                    ...opts,
                    contacts: [contact_id]
                }
            }
        }

        return {
            remote_data: engagement,
            remote_id: engagement.activityid,
            content: engagement.description ?? '',
            subject: engagement.subject ?? '',
            start_at: engagement.actualstart ? new Date(engagement.actualstart) : null,
            end_time: engagement.actualend ? new Date(engagement.actualend) : null,
            type: 'MEETING',
            field_mappings,
            ...opts,
        };
    }

    private async mapSingleEngagementEmailToUnified(
        engagement: MicrosoftdynamicssalesEngagementEmailOutput,
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
        if (engagement._ownerid_value) {
            const owner_id = await this.utils.getUserUuidFromRemoteId(
                engagement._ownerid_value,
                connectionId,
            );
            if (owner_id) {
                opts = {
                    ...opts,
                    user_id: owner_id,
                };
            }
        }

        if (engagement._regardingobjectid_value) {
            const company_id = await this.utils.getCompanyUuidFromRemoteId(
                engagement._regardingobjectid_value,
                connectionId
            );

            if (company_id) {
                opts = {
                    ...opts,
                    company_id: company_id
                }
            }

            const contact_id = await this.utils.getContactUuidFromRemoteId(
                engagement._regardingobjectid_value,
                connectionId
            );

            if (contact_id) {
                opts = {
                    ...opts,
                    contacts: [contact_id]
                }
            }
        }

        return {
            remote_id: engagement.activityid,
            remote_data: engagement,
            content: engagement.description ?? '',
            start_at: engagement.actualstart ? new Date(engagement.actualstart) : null,
            end_time: engagement.actualend ? new Date(engagement.actualend) : null,
            subject: engagement.subject ?? '',
            type: 'EMAIL',
            direction: engagement.directioncode ? engagement.directioncode ? "OUTBOUND" : "INBOUND" : null,
            field_mappings,
            ...opts,
        };
    }
}
