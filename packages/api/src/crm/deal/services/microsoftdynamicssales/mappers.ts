import { Injectable } from '@nestjs/common';
import {
    UnifiedCrmDealInput,
    UnifiedCrmDealOutput,
} from '@crm/deal/types/model.unified';
import { IDealMapper } from '@crm/deal/types';
import { Utils } from '@crm/@lib/@utils';
import { MappersRegistry } from '@@core/@core-services/registries/mappers.registry';
import { MicrosoftdynamicssalesDealInput, MicrosoftdynamicssalesDealOutput } from './types';

@Injectable()
export class MicrosoftdynamicssalesDealMapper implements IDealMapper {
    constructor(private mappersRegistry: MappersRegistry, private utils: Utils) {
        this.mappersRegistry.registerService('crm', 'deal', 'microsoftdynamicssales', this);
    }

    async desunify(
        source: UnifiedCrmDealInput,
        customFieldMappings?: {
            slug: string;
            remote_id: string;
        }[],
    ): Promise<MicrosoftdynamicssalesDealInput> {
        const result: MicrosoftdynamicssalesDealInput = {
            name: source.name,
            description: source.description,
            budgetamount: source.amount
        }




        if (source.company_id) {
            const id = await this.utils.getRemoteIdFromCompanyUuid(source.company_id);
            result["parentaccountid@odata.bind"] = `/accounts(${id})`;
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
        source: MicrosoftdynamicssalesDealOutput | MicrosoftdynamicssalesDealOutput[],
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
        // Handling array of MicrosoftdynamicssalesDealOutput
        return Promise.all(
            source.map((deal) =>
                this.mapSingleDealToUnified(deal, connectionId, customFieldMappings),
            ),
        );
    }

    private async mapSingleDealToUnified(
        deal: MicrosoftdynamicssalesDealOutput,
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

        let opts: any = {};

        if (deal._ownerid_value) {
            const user_id = await this.utils.getUserUuidFromRemoteId(
                deal._ownerid_value,
                connectionId
            );
            if (user_id) {
                opts = {
                    ...opts,
                    user_id: user_id
                }
            }
        }

        if (deal._customerid_value) {
            const company_id = await this.utils.getCompanyUuidFromRemoteId(
                deal._customerid_value,
                connectionId
            );
            if (company_id) {
                opts = {
                    ...opts,
                    company_id: company_id
                }
            }
        }


        return {
            remote_id: deal.opportunityid,
            remote_data: deal,
            name: deal.name ?? '',
            description: deal.description ?? '',
            amount: deal.totalamount ?? 0,
            field_mappings,
            ...opts,
        };
    }
}
