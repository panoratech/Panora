import { AffinityUserInput, AffinityUserOutput } from './types';
import {
    UnifiedUserInput,
    UnifiedUserOutput,
} from '@crm/user/types/model.unified';
import { IUserMapper } from '@crm/user/types';
import { MappersRegistry } from '@@core/utils/registry/mappings.registry';
import { Injectable } from '@nestjs/common';
import { Utils } from '@crm/@lib/@utils';
export class AffinityUserMapper implements IUserMapper {

    constructor(private mappersRegistry: MappersRegistry, private utils: Utils) {
        this.mappersRegistry.registerService('crm', 'user', 'affinity', this);
    }

    desunify(
        source: UnifiedUserInput,
        customFieldMappings?: {
            slug: string;
            remote_id: string;
        }[],
    ): AffinityUserInput {
        return;
    }

    unify(
        source: AffinityUserOutput | AffinityUserOutput[],
        customFieldMappings?: {
            slug: string;
            remote_id: string;
        }[],
    ): UnifiedUserOutput | UnifiedUserOutput[] {
        if (!Array.isArray(source)) {
            return this.mapSingleUserToUnified(source, customFieldMappings);
        }
        // Handling array of AffinityUserOutput
        return source.map((user) =>
            this.mapSingleUserToUnified(user, customFieldMappings),
        );
    }

    private mapSingleUserToUnified(
        user: AffinityUserOutput,
        customFieldMappings?: {
            slug: string;
            remote_id: string;
        }[],
    ): UnifiedUserOutput {
        const field_mappings: { [key: string]: any } = {};
        if (customFieldMappings) {
            for (const mapping of customFieldMappings) {
                field_mappings[mapping.slug] = user[mapping.remote_id];
            }
        }
        return {
            remote_id: String(user.user.id),
            name: `${user.user?.firstName} ${user.user?.lastName}`,
            email: user.user?.email,
            field_mappings,
        };
    }
}
