import { AffinityNoteInput, AffinityNoteOutput } from './types';
import {
    UnifiedNoteInput,
    UnifiedNoteOutput,
} from '@crm/note/types/model.unified';
import { INoteMapper } from '@crm/note/types';
import { Utils } from '@crm/@lib/@utils';
import { MappersRegistry } from '@@core/utils/registry/mappings.registry';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AffinityNoteMapper implements INoteMapper {
    constructor(private mappersRegistry: MappersRegistry, private utils: Utils) {
        this.mappersRegistry.registerService('crm', 'note', 'affinity', this);
    }

    async desunify(
        source: UnifiedNoteInput,
        customFieldMappings?: {
            slug: string;
            remote_id: string;
        }[],
    ): Promise<AffinityNoteInput> {


        let opts: any = {};

        if (source.user_id) {
            const creator_id = await this.utils.getRemoteIdFromUserUuid(source.user_id);
            if (creator_id) {
                opts = {
                    ...opts,
                    creator_id
                }
            }
        }

        if (source.company_id) {
            const organization_id = await this.utils.getRemoteIdFromCompanyUuid(source.company_id);
            if (organization_id) {
                opts = {
                    ...opts,
                    organization_ids: [organization_id]
                }
            }
        }

        if (source.contact_id) {
            const person_id = await this.utils.getRemoteIdFromContactUuid(source.contact_id);
            if (person_id) {
                opts = {
                    ...opts,
                    person_ids: [person_id]
                }
            }
        }

        if (source.deal_id) {
            const opportunity_id = await this.utils.getRemoteIdFromDealUuid(source.deal_id);
            if (opportunity_id) {
                opts = {
                    ...opts,
                    opportunity_ids: [opportunity_id]
                }
            }
        }

        const result: AffinityNoteInput = {
            content: source.content,
            ...opts
        };

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
        source: AffinityNoteOutput | AffinityNoteOutput[],
        customFieldMappings?: {
            slug: string;
            remote_id: string;
        }[],
    ): Promise<UnifiedNoteOutput | UnifiedNoteOutput[]> {
        if (!Array.isArray(source)) {
            return await this.mapSingleNoteToUnified(source, customFieldMappings);
        }

        return Promise.all(
            source.map((note) =>
                this.mapSingleNoteToUnified(note, customFieldMappings),
            ),
        );
    }

    private async mapSingleNoteToUnified(
        note: AffinityNoteOutput,
        customFieldMappings?: {
            slug: string;
            remote_id: string;
        }[],
    ): Promise<UnifiedNoteOutput> {
        const field_mappings: { [key: string]: any } = {};
        if (customFieldMappings) {
            for (const mapping of customFieldMappings) {
                field_mappings[mapping.slug] = note[mapping.remote_id];
            }
        }

        let opts: any = {};

        if (note.creator_id) {
            const user_id = await this.utils.getUserUuidFromRemoteId(
                String(note.creator_id),
                'affinity'
            );
            if (user_id) {
                opts = {
                    ...opts,
                    user_id
                }
            }
        }

        if (note.organization_ids && note.organization_ids.length > 0) {
            const company_id = await this.utils.getCompanyUuidFromRemoteId(
                String(note.organization_ids[0]),
                'affinity'
            );
            if (company_id) {
                opts = {
                    ...opts,
                    company_id
                }
            }
        }

        if (note.person_ids && note.person_ids.length > 0) {
            const contact_id = await this.utils.getContactUuidFromRemoteId(
                String(note.person_ids[0]),
                'affinity'
            );
            if (contact_id) {
                opts = {
                    ...opts,
                    contact_id
                }
            }
        }

        if (note.opportunity_ids && note.opportunity_ids.length > 0) {
            const deal_id = await this.utils.getDealUuidFromRemoteId(
                String(note.opportunity_ids[0]),
                'affinity'
            );
            if (deal_id) {
                opts = {
                    ...opts,
                    deal_id
                }
            }
        }



        return {
            remote_id: note.id,
            content: note.content,
            field_mappings,
            ...opts,
        };
    }
}
