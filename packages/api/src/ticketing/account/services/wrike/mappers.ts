import { MappersRegistry } from '@@core/utils/registry/mappings.registry';
import { Utils } from '@ticketing/@lib/@utils';
import { Injectable } from '@nestjs/common';
import { IAccountMapper } from '@ticketing/account/types';
import { UnifiedAccountInput, UnifiedAccountOutput } from '@ticketing/account/types/model.unified';
import { WrikeAccountInput, WrikeAccountOutput } from './types';

@Injectable()
export class WrikeAccountMapper implements IAccountMapper {
    constructor(private mappersRegistry: MappersRegistry, private utils: Utils) {
        this.mappersRegistry.registerService('ticketing', 'account', 'wrike', this);
    }
    desunify(
        source: UnifiedAccountInput,
        customFieldMappings?: {
            slug: string;
            remote_id: string;
        }[],
    ): WrikeAccountInput {
        return;
    }

    unify(
        source: WrikeAccountOutput | WrikeAccountOutput[],
        customFieldMappings?: {
            slug: string;
            remote_id: string;
        }[],
    ): UnifiedAccountOutput | UnifiedAccountOutput[] {
        const sourcesArray = Array.isArray(source) ? source : [source];

        return sourcesArray.map((account) =>
            this.mapSingleAccountToUnified(account, customFieldMappings),
        );
    }

    private mapSingleAccountToUnified(
        account: WrikeAccountOutput,
        customFieldMappings?: {
            slug: string;
            remote_id: string;
        }[],
    ): UnifiedAccountOutput {
        const field_mappings: { [key: string]: any } = {};
        if (customFieldMappings) {
            for (const mapping of customFieldMappings) {
                field_mappings[mapping.slug] = account.custom_fields[mapping.remote_id];
            }
        }

        const unifiedAccount: UnifiedAccountOutput = {
            remote_id: account.id,
            name: account.name,
            domains: account.domains.flat(),
            field_mappings: field_mappings,
        };

        return unifiedAccount;
    }
}