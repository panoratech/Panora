import { Injectable } from '@nestjs/common';
import {
    UnifiedCrmDealInput,
    UnifiedCrmDealOutput,
} from '@crm/deal/types/model.unified';
import { IDealMapper } from '@crm/deal/types';
import { Utils } from '@crm/@lib/@utils';
import { MappersRegistry } from '@@core/@core-services/registries/mappers.registry';
import { AffinityDealInput, AffinityDealOutput } from './types';

@Injectable()
export class AffinityDealMapper implements IDealMapper {
    constructor(private mappersRegistry: MappersRegistry, private utils: Utils) {
        this.mappersRegistry.registerService('crm', 'deal', 'affinity', this);
    }

    async desunify(
        source: UnifiedCrmDealInput,
        customFieldMappings?: {
            slug: string;
            remote_id: string;
        }[],
    ): Promise<AffinityDealInput> {

        let opts: any = {};

        if (source.company_id) {
            const organization_id = await this.utils.getRemoteIdFromCompanyUuid(source.company_id);
            if (organization_id) {
                opts = {
                    ...opts,
                    organization_ids: [organization_id]
                }
            }
        }

        const result: AffinityDealInput = {
            name: source.name,
            list_id: 21,
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
        source: AffinityDealOutput | AffinityDealOutput[],
        connectionId: string,
        customFieldMappings?: {
            slug: string;
            remote_id: string;
        }[],
    ): Promise<UnifiedCrmDealOutput | UnifiedCrmDealOutput[]> {
        if (!Array.isArray(source)) {
            return await this.mapSingleDealToUnified(
                source,
                connectionId,
                customFieldMappings,
            );
        }
        // Handling array of AffinityDealOutput
        return Promise.all(
            source.map((deal) =>
                this.mapSingleDealToUnified(deal, connectionId, customFieldMappings),
            ),
        );
    }

    private async mapSingleDealToUnified(
        deal: AffinityDealOutput,
        connectionId: string,
        customFieldMappings?: {
            slug: string;
            remote_id: string;
        }[],
    ): Promise<UnifiedCrmDealOutput> {
        const field_mappings: { [key: string]: any } = {};
        if (customFieldMappings) {
            for (const mapping of customFieldMappings) {
                field_mappings[mapping.slug] = deal[mapping.remote_id];
            }
        }

        let opts: any = {}

        if (deal.list_entries) {
            const user_id = await this.utils.getUserUuidFromRemoteId(
                String(deal.list_entries[0].creator_id),
                'affinity'
            );
            if (user_id) {
                opts = {
                    ...opts,
                    user_id
                }
            }
        }

        if (deal.organization_ids && deal.organization_ids.length > 0) {
            const company_id = await this.utils.getCompanyUuidFromRemoteId(
                String(deal.organization_ids[0]),
                'affinity'
            );

            if (company_id) {
                opts = {
                    ...opts,
                    company_id
                }
            }
        }

        return {
            remote_id: String(deal.id),
            name: deal.name,
            description: '', // Placeholder if there's no direct mapping
            amount: 0,
            field_mappings,
            ...opts
        };
    }
}
