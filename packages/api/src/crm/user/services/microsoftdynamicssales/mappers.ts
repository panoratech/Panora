import { MicrosoftdynamicssalesUserOutput } from './types';
import {
    UnifiedCrmUserInput,
    UnifiedCrmUserOutput,
} from '@crm/user/types/model.unified';
import { IUserMapper } from '@crm/user/types';
import { MappersRegistry } from '@@core/@core-services/registries/mappers.registry';
import { Injectable } from '@nestjs/common';
import { Utils } from '@crm/@lib/@utils';

@Injectable()
export class MicrosoftdynamicssalesUserMapper implements IUserMapper {
    constructor(private mappersRegistry: MappersRegistry, private utils: Utils) {
        this.mappersRegistry.registerService('crm', 'user', 'microsoftdynamicssales', this);
    }
    desunify(
        source: UnifiedCrmUserInput,
        customFieldMappings?: {
            slug: string;
            remote_id: string;
        }[],
    ) {
        return;
    }

    unify(
        source: MicrosoftdynamicssalesUserOutput | MicrosoftdynamicssalesUserOutput[],
        connectionId: string,
        customFieldMappings?: {
            slug: string;
            remote_id: string;
        }[],
    ): Promise<UnifiedCrmUserOutput | UnifiedCrmUserOutput[]> {
        if (!Array.isArray(source)) {
            return this.mapSingleUserToUnified(
                source,
                connectionId,
                customFieldMappings,
            );
        }
        // Handling array of MicrosoftdynamicssalesUserOutput
        return Promise.all(
            source.map((user) =>
                this.mapSingleUserToUnified(user, connectionId, customFieldMappings),
            ),
        );
    }

    private async mapSingleUserToUnified(
        user: MicrosoftdynamicssalesUserOutput,
        connectionId: string,
        customFieldMappings?: {
            slug: string;
            remote_id: string;
        }[],
    ): Promise<UnifiedCrmUserOutput> {
        const field_mappings: { [key: string]: any } = {};
        if (customFieldMappings) {
            for (const mapping of customFieldMappings) {
                field_mappings[mapping.slug] = user[mapping.remote_id];
            }
        }
        return {
            remote_id: user.ownerid,
            remote_data: user,
            name: `${user.firstname} ${user.lastname}`,
            email: user.personalemailaddress,
            field_mappings,
        };
    }
}
