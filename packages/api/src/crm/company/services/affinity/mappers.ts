import { AffinityCompanyInput, AffinityCompanyOutput } from './types';
import {
    UnifiedCrmCompanyInput,
    UnifiedCrmCompanyOutput,
} from '@crm/company/types/model.unified';
import { ICompanyMapper } from '@crm/company/types';
import { Utils } from '@crm/@lib/@utils';
import { Injectable } from '@nestjs/common';
import { MappersRegistry } from '@@core/@core-services/registries/mappers.registry';
import { getCountryCode, getCountryName } from '@@core/utils/types';

@Injectable()
export class AffinityCompanyMapper implements ICompanyMapper {
    constructor(private mappersRegistry: MappersRegistry, private utils: Utils) {
        this.mappersRegistry.registerService('crm', 'company', 'affinity', this);
    }
    async desunify(
        source: UnifiedCrmCompanyInput,
        customFieldMappings?: {
            slug: string;
            remote_id: string;
        }[],
    ): Promise<AffinityCompanyInput> {
        const result: AffinityCompanyInput = {
            name: source.name
        };

        // Affinity company does not have attribute for email address
        // Affinity Company doest not have direct mapping of number of employees

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
        source: AffinityCompanyOutput | AffinityCompanyOutput[],
        connectionId: string,
        customFieldMappings?: {
            slug: string;
            remote_id: string;
        }[],
    ): Promise<UnifiedCrmCompanyOutput | UnifiedCrmCompanyOutput[]> {
        if (!Array.isArray(source)) {
            return this.mapSingleCompanyToUnified(
                source,
                connectionId,
                customFieldMappings,
            );
        }
        // Handling array of AffinityCompanyOutput
        return Promise.all(
            source.map((company) =>
                this.mapSingleCompanyToUnified(
                    company,
                    connectionId,
                    customFieldMappings,
                ),
            ),
        );
    }

    private async mapSingleCompanyToUnified(
        company: AffinityCompanyOutput,
        connectionId: string,
        customFieldMappings?: {
            slug: string;
            remote_id: string;
        }[],
    ): Promise<UnifiedCrmCompanyOutput> {
        const field_mappings: { [key: string]: any } = {};
        if (customFieldMappings) {
            for (const mapping of customFieldMappings) {
                field_mappings[mapping.slug] = company[mapping.remote_id];
            }
        }

        let opts: any = {};

        return {
            remote_id: company.id,
            name: company.name,
            field_mappings,
            ...opts,
        };
    }
}
