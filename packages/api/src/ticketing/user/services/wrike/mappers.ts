import { MappersRegistry } from "@@core/utils/registry/mappings.registry";
import { Injectable } from "@nestjs/common";
import { Utils } from "@ticketing/@lib/@utils";
import { IUserMapper } from "@ticketing/user/types";
import { UnifiedUserInput, UnifiedUserOutput } from "@ticketing/user/types/model.unified";
import { WrikeUserInput, WrikeUserOutput } from "./types";

@Injectable()
export class WrikeUserMapper implements IUserMapper {
    constructor(private mappersRegistry: MappersRegistry, private utils: Utils) {
        this.mappersRegistry.registerService('ticketing', 'user', 'wrike', this);
    }
    desunify(
        source: UnifiedUserInput,
        customFieldMappings?: {
            slug: string;
            remote_id: string;
        }[],
    ): WrikeUserInput {
        return;
    }

    unify(
        source: WrikeUserOutput | WrikeUserOutput[],
        customFieldMappings?: {
            slug: string;
            remote_id: string
        }[],
    ): UnifiedUserOutput | UnifiedUserOutput[] {
        const sourcesArray = Array.isArray(source) ? source : [source];

        return sourcesArray.map((user) =>
            this.mapSingleUserToUnified(user, customFieldMappings),
        );
    }

    private mapSingleUserToUnified(
        user: WrikeUserOutput,
        customFieldMappings?: {
            slug: string;
            remote_id: string;
        }[],
    ): UnifiedUserOutput {
        const field_mappings: { [key: string]: any } = {};
        if (customFieldMappings) {
            for (const mapping of customFieldMappings) {
                field_mappings[mapping.slug] = user.custom_fields[mapping.remote_id];
            }
        }

        const unifiedUser: UnifiedUserOutput = {
            remote_id: user.id,
            name: `${user.last_name} ${user.last_name}`,
            email_address: user.email,
            field_mappings: field_mappings,
        };

        return unifiedUser;
    }
}